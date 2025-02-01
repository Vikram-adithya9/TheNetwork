const User = require('../models/User');
const AIRequestDB =require('../models/AiChatRequests');
const AiService = require('../services/AiService');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('posts', 'title content createdAt')
            .populate('comments', 'content createdAt')
            .populate('followers', 'username name profilePic')
            .populate('following', 'username name profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            username: user.username,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            gender: user.gender,
            posts: user.posts,
            comments: user.comments,
            followers: user.followers,
            following: user.following,
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, name, email, profilePic, gender } = req.body;

        if (!username || !name || !email || !gender) {
            return res.status(400).json({ message: 'Username, name, email, and gender are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email !== email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email is already taken' });
            }
        }

        if (user.username !== username) {
            const unameExists = await User.findOne({ username });
            if (unameExists) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        user.username = username || user.username;
        user.name = name || user.name;
        user.email = email || user.email;
        user.profilePic = profilePic || user.profilePic;
        user.gender = gender || user.gender;

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                gender: user.gender
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.followUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.followers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        user.followers.push(req.user.id);
        currentUser.following.push(req.params.id);

        await user.save();
        await currentUser.save();

        res.status(200).json({ message: 'User followed successfully', user });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.followers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        user.followers = user.followers.filter(id => id.toString() !== req.user.id);
        currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);

        await user.save();
        await currentUser.save();

        res.status(200).json({ message: 'User unfollowed successfully', user });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username name profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ followers: user.followers });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username name profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ following: user.following });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const users = await User.find({ username: { $regex: username, $options: 'i' } })
            .select('username name profilePic');

        res.status(200).json({ users });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.removeFollower = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.followers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        user.followers = user.followers.filter(id => id.toString() !== req.user.id);
        currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);

        await user.save();
        await currentUser.save();

        res.status(200).json({ message: 'Follower removed successfully', user });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getFeed = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('following', 'posts') // Populate the following users and get their posts
            .populate('followers', 'posts'); // Optionally, include followers' posts if needed

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the posts of the users the current user is following
        const followingPosts = await Post.find({
            author: { $in: user.following.map(following => following._id) },
            anonymous: false  // Exclude anonymous posts
        })
        .sort({ createdAt: -1 })  // Sort posts by creation date (latest first)
        .populate('author', 'username name profilePic'); // Populate author details

        // You can also include the posts of the user themselves, if necessary
        /*const userPosts = await Post.find({ author: user._id, anonymous: false })
            .sort({ createdAt: -1 })
            .populate('author', 'username name profilePic');*/

        // Combine the posts from the following and the user’s own posts
        const feed = [...followingPosts, ...userPosts];

        // Optionally, sort the feed by the created date if you want the most recent posts to appear at the top
        feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ feed });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.acceptFollowRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const follower = await User.findById(req.params.id);

        if (!user || !follower) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.followRequests.includes(req.params.id)) {
            return res.status(400).json({ message: 'No follow request found' });
        }

        user.followers.push(req.params.id);
        follower.following.push(req.user.id);

        user.followRequests = user.followRequests.filter(id => id.toString() !== req.params.id);

        await user.save();
        await follower.save();

        res.status(200).json({ message: 'Follow request accepted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.rejectFollowRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.followRequests.includes(req.params.id)) {
            return res.status(400).json({ message: 'No follow request found' });
        }

        user.followRequests = user.followRequests.filter(id => id.toString() !== req.params.id);
        
        await user.save();

        res.status(200).json({ message: 'Follow request rejected successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getFollowRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('followRequests', 'username name profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ followRequests: user.followRequests });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.sendFollowRequest = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!user || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.followers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        if (user.followRequests.includes(req.user.id)) {
            return res.status(400).json({ message: 'Follow request already sent' });
        }

        user.followRequests.push(req.user.id);

        await user.save();

        res.status(200).json({ message: 'Follow request sent successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.cancelFollowRequest = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.followRequests.includes(req.user.id)) {
            return res.status(400).json({ message: 'No follow request found' });
        }

        user.followRequests = user.followRequests.filter(id => id.toString() !== req.user.id);

        await user.save();

        res.status(200).json({ message: 'Follow request cancelled successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.uploadProfilePic = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profilePic = req.file.filename;

        await user.save();

        res.status(200).json({ message: 'Profile picture uploaded successfully', profilePic: user.profilePic });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getSelfProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('posts', 'title content createdAt')
            .populate('comments', 'content createdAt')
            .populate('followers', 'username name profilePic')
            .populate('following', 'username name profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            username: user.username,
            name: user.name,
            email: user.email,
            profilePic: user.profile
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.stratchUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.scratchers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already scratching this user' });
        }

        user.scratchers.push(req.user.id);
        currentUser.scratching.push(req.params.id);

        await user.save();
        await currentUser.save();

        res.status(200).json({ message: 'User scratched successfully', user });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.unstratchUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.scratchers.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are not scratching this user' });
        }

        user.scratchers = user.scratchers.filter(id => id.toString() !== req.user.id);
        currentUser.scratching = currentUser.scratching.filter(id => id.toString() !== req.params.id);

        await user.save();
        await currentUser.save();

        res.status(200).json({ message: 'User unscratched successfully', user });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getScratchers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('scratchers', 'username name profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ scratchers: user.scratchers });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getScratching = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('scratching', 'username name profilePic');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ scratching: user.scratching });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getAiChatSuggestions = async (req, res) => {
    try {
        /**
         * Chat data should be in the following format:
         * {
         *  message: 'Prompt message',
         *  chatlog: [
         *     { sender: 'Sender', message: 'Hello' },
         *     { sender: 'User', message: 'Hi there! How can I help you'},
         *    ]
         * }
         */
        const chatData = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (AIRequestDB.findOne({userId: req.user.id})) {
            return res.status(400).json({ message: 'Wait for 10 seconds beore requesting again' });
        }

        AIRequestDB.create({userId: req.user.id});
        
        const prompt = chatData.message;
        const response = await AiService.GenerateAiResponse(prompt, chatData.chatlog);

        res.status(200).json({ response });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.blockUser = async (req, res) => {
    const currentUser = await User.findById(req.user.id);
    const userToBlock = await User.findById(req.params.id);

    if (!currentUser) {
        return res.status(400).json({ message: 'User not found'});
    }

    if (!userToBlock) {
        return res.status(400).json({ message: 'User not found'});
    }

    currentUser.blocked.push(req.user.id);
    userToBlock.blockedBy.push(req.user.id);

    await currentUser.save();
    await userToBlock.save();

    res.status(200).json({ response });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.blacklistUser = async (req, res) => {
    const currentUser = await User.findById(req.user.id);
    const userToBlacklist = await User.findById(req.params.id);

    if (!currentUser) {
        return res.status(400).json({ message: 'User not found'});
    }

    if (!userToBlock) {
        return res.status(400).json({ message: 'User not found'});
    }

    currentUser.blacklist.push(req.user.id);
    userToBlacklist.blacklistedBy.push(req.user.id);

    await currentUser.save();
    await userToBlacklist.save();

    res.status(200).json({ response });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
