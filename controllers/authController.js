const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../services/emailService');  

exports.register = async (req, res) => {
  try {
    const { username, name, email, password, gender } = req.body;

    // Ensure username is provided
    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Ensure 'name' is provided
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate the email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create a new user
    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
      gender,
      emailVerificationToken,
    });

    // Save the user to the database
    await newUser.save();

    // Send verification email
    const verificationUrl = `https://flashroad.vercel.app/api/auth/verify-email/${emailVerificationToken}`;
    const mailContent = `Here is the link to verify your email for CampusConnect: ${verificationUrl}
    
    Click the link to verify your email, if it doesn't work, try copying and opening the link in your browser.
    Happy journey and good luck with making new friends

    Regards,
    Team CampusConnect`;

    await sendEmail(email, 'Verify Your Email', mailContent);

    // Respond with a success message
    res.status(201).json({ message: 'User registered successfully, please check your email for verification.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};



exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;  

    await user.save();

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10d' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({
      email,
    });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `https://flashroad.vercel.app/reset-password/${resetToken}`;
    const mailContent = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.

    Please click on the following link, or paste this into your browser to complete the process:
    ${resetUrl}

    If you did not request this, please ignore this email and your password will remain unchanged.`;

    await sendEmail(email, 'Password Reset Request', mailContent);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};