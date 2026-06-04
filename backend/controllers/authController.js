import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'rentgb_super_secret_jwt_signature_key_2026', 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'User already registered with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Default status is active
    const userRole = role || 'tenant';
    const isVerified = userRole === 'tenant'; // Auto-verify tenants, owners and admins go through approval

    // Create User
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, cleanEmail, password_hash, userRole, isVerified]
    );

    const user = result.rows[0];

    // If owner, create empty owner profile
    if (userRole === 'owner') {
      await db.query(
        'INSERT INTO owner_profiles (user_id, business_name, contact_number, business_address, is_verified) VALUES ($1, $2, $3, $4, $5)',
        [user.id, '', '', '', false]
      );
    }

    // Create system notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [
        user.id, 
        'Welcome to RentGB!', 
        userRole === 'owner' 
          ? 'Your owner profile has been registered. Please complete your profile details for verification.' 
          : 'Your RentGB tenant profile is active. Find direct rentals in Gilgit-Baltistan now!'
      ]
    );

    // Create system activity log
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user.id, 'REGISTER', `Registered new user with role: ${userRole}`]
    );

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      token: generateToken(user.id)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Log login action
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user.id, 'LOGIN', 'Logged into RentGB portal']
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      token: generateToken(user.id)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    const userQuery = await db.query('SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = userQuery.rows[0];

    if (user.role === 'owner') {
      const profileQuery = await db.query('SELECT * FROM owner_profiles WHERE user_id = $1', [user.id]);
      const profile = profileQuery.rows[0] || {};
      return res.json({ ...user, profile });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  const { name, email, businessName, contactNumber, businessAddress } = req.body;

  try {
    const userQuery = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userQuery.rows[0];

    let cleanEmail = email ? email.toLowerCase().trim() : user.email;
    let newName = name || user.name;

    // Check if email already in use
    if (cleanEmail !== user.email) {
      const exist = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [cleanEmail, user.id]);
      if (exist.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update User
    const updatedUser = await db.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, is_verified',
      [newName, cleanEmail, user.id]
    );

    // If Owner role, update Owner Profile
    if (user.role === 'owner') {
      await db.query(
        'UPDATE owner_profiles SET business_name = $1, contact_number = $2, business_address = $3 WHERE user_id = $4',
        [businessName || '', contactNumber || '', businessAddress || '', user.id]
      );
    }

    // Log profile update
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [user.id, 'UPDATE_PROFILE', 'Updated profile information']
    );

    // Fetch refreshed info
    const refreshedUserQuery = await db.query('SELECT id, name, email, role, is_verified FROM users WHERE id = $1', [user.id]);
    const refreshedUser = refreshedUserQuery.rows[0];

    if (user.role === 'owner') {
      const profileQuery = await db.query('SELECT * FROM owner_profiles WHERE user_id = $1', [user.id]);
      refreshedUser.profile = profileQuery.rows[0];
    }

    res.json(refreshedUser);
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const exist = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (exist.rows.length === 0) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    res.json({ message: 'Password reset link sent to email (Simulated)' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Simulate reset since it's a demo
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};
