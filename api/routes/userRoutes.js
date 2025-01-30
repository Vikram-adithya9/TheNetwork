const { getProfile, updateProfile, followUser, unfollowUser, getFollowers, getFollowing, searchUsers, removeFollower, getFeed, acceptFollowRequest, rejectFollowRequest, getFollowRequests, sendFollowRequest, cancelFollowRequest, uploadProfilePic, getSelfProfile } = require('../controllers/userController');
const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/profile/:id', getProfile);
router.put('/profile', protect, updateProfile);
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);
router.get('/followers/:id', getFollowers);
router.get('/following/:id', getFollowing);
router.get('/search', searchUsers);
router.put('/removeFollower/:id', protect, removeFollower);
router.get('/feed', protect, getFeed);
router.put('/acceptFollowRequest/:id', protect, acceptFollowRequest);
router.put('/rejectFollowRequest/:id', protect, rejectFollowRequest);
router.get('/followRequests', protect, getFollowRequests);
router.put('/sendFollowRequest/:id', protect, sendFollowRequest);
router.put('/cancelFollowRequest/:id', protect, cancelFollowRequest);
router.post('/uploadProfilePic', protect, uploadProfilePic);
router.get('/selfProfile', protect, getSelfProfile);

module.exports = router;