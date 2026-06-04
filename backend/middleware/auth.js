import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const protect = async (req, res, next) => {
  try {
    let token = '';

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rentgb_super_secret_jwt_signature_key_2026');

    // Get user from database
    const userQuery = await db.query('SELECT id, name, email, role, status FROM users WHERE id = $1', [decoded.id]);
    
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: 'User not found in system' });
    }

    const user = userQuery.rows[0];

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user ? req.user.role : 'Guest'}) is not authorized to access this resource` 
      });
    }
    next();
  };
};
