const express = require('express');
const { createComment, removeComment, updateComment, likeComment, dislikeComment } = require('../../controllers/commentController');
const { protect } = require('../../middleware/auth');
const router = express.Router();

router.post('/create', protect, createComment);
router.delete('/:id', protect, removeComment);
router.put('/:id', protect, updateComment);
router.put('/:id/like', protect, likeComment);
router.put('/:id/dislike', protect, dislikeComment);

module.exports = router;