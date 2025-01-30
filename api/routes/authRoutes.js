const express = require('express');
const { register, login, verifyEmail, forgetPassword, resetPassword } = require('../../controllers/authController')
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);  
router.post('/forgot-password', forgetPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;