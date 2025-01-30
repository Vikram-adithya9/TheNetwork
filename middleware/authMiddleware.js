const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; 

  if (!token) return res.render('login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 

    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.banned) {
      return res.status(403).json({ message: 'Your account has been banned' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email address' });
    }

    next(); 
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid', error });
  }
};