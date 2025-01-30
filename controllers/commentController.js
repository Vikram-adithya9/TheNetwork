const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.createComment = async (req, res) => {
    try {
        const { content, anonymous, postId, parentCommentId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const newComment = new Comment({
            content,
            anonymous,
        });

        if (postId) {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            newComment.post = postId;
        }

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }

            newComment.parentComment = parentCommentId;
            parentComment.comments.push(newComment._id);
            await parentComment.save();
        }

        await newComment.save();

        res.status(201).json({ message: 'Comment created successfully', comment: newComment });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.removeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        await comment.remove();

        res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this comment' });
        }

        comment.content = content;
        await comment.save();

        res.status(200).json({ message: 'Comment updated successfully', comment });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.likes.includes(req.user.id)) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
        } else {
            comment.likes.push(req.user.id);
            comment.dislikes = comment.dislikes.filter(id => id.toString() !== req.user.id);
        }

        await comment.save();

        res.status(200).json({ message: 'Comment liked successfully', comment });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.dislikeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.dislikes.includes(req.user.id)) {
            comment.dislikes = comment.dislikes.filter(id => id.toString() !== req.user.id);
        } else {
            comment.dislikes.push(req.user.id);
            comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
        }

        await comment.save();

        res.status(200).json({ message: 'Comment disliked successfully', comment });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};