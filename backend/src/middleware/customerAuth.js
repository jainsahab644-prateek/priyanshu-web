const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'banithanitextilessecretkeysupersecure123');
    // Ensure the token belongs to a customer and not an admin
    if (decoded.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied: not a customer account' });
    }
    req.customer = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
