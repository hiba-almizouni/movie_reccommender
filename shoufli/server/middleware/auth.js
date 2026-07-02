const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error:'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'shoufli_secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error:'User not found' });
    next();
  } catch (e) { res.status(401).json({ error:'Token invalid' }); }
};

const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'shoufli_secret');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {}
  }
  next();
};

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'shoufli_secret', { expiresIn:'30d' });

module.exports = { protect, optionalAuth, generateToken };
