const express = require('express');
const { createPost, getUserPosts, deletePost, updatePost, getPost, likePost, dislikePost } = require('../../controllers/postController');
const { protect } = require('../../middleware/auth');
const router = express.Router();

router.post('/create', protect, createPost);
router.get('/user/:id', getUserPosts);
router.delete('/:id', protect, deletePost);
router.get('/:id', getPost);
router.put('/:id', protect, updatePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/dislike', protect, dislikePost);

module.exports = router;