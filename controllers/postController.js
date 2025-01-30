const User = require('../models/User');
const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { title, content, anonymous } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newPost = new Post({
      title,
      content,
      author: req.user.id,
      anonymous
    });

    await newPost.save();
    user.posts.push(newPost);
    await user.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
        }
};

exports.getUserPosts = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate({
            path: 'posts',
            match: { anonymous: false },
            select: 'title content createdAt updatedAt'
        });
        res.status(200).json({ posts: user.posts });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
    };

exports.deletePost = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        await post.remove();
        user.posts = user.posts.filter(p => p.toString() !== req.params.id);
        await user.save();

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, content, anonymous } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this post' });
        }

        post.title = title;
        post.content = content;
        post.anonymous = anonymous;
        await post.save();

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate({
                path: 'author',
                select: 'name email id'
            });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const postDetails = {
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            likesCount: post.likes.length,
            dislikesCount: post.dislikes.length,
        };

        if (!post.anonymous) {
            postDetails.author = post.author;
        } else {
            postDetails.author = 'Anonymous';
        }

        res.status(200).json({ post: postDetails });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.likes.includes(req.user.id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        } else {
            post.likes.push(req.user.id);
            post.dislikes = post.dislikes.filter(id => id.toString() !== req.user.id);
        }

        await post.save();

        res.status(200).json({ message: 'Post liked successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.dislikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.dislikes.includes(req.user.id)) {
            post.dislikes = post.dislikes.filter(id => id.toString() !== req.user.id);
        } else {
            post.dislikes.push(req.user.id);
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        }

        await post.save();

        res.status(200).json({ message: 'Post disliked successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};