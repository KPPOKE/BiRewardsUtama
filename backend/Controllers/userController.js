import pool from '../db.js';
import AppError from '../utils/AppError.js';
import path from 'path';
import bcrypt from 'bcrypt';

// Get all users with pagination
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT id, name, email, role, points, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    next(new AppError('Error fetching users', 500));
  }
};

// Create new user
export const createUser = async (req, res, next) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return next(new AppError('Name, email and password are required', 400));
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return next(new AppError('Email already in use', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, points) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, points',
      [name, email, hashedPassword, role, 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(new AppError('Error creating user', 500));
  }
};

// User login (add this function)
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return next(new AppError('User not found', 401));
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError('Invalid password', 401));
    }
    // Remove password from response
    delete user.password;
    res.json({ success: true, data: user });
  } catch (error) {
    next(new AppError('Error logging in', 500));
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, role, points } = req.body;

  try {
    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    // Update user
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), points = COALESCE($4, points) WHERE id = $5 RETURNING id, name, email, role, points',
      [name, email, role, points, id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(new AppError('Error updating user', 500));
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.status(204).send();
  } catch (error) {
    next(new AppError('Error deleting user', 500));
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, points, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(new AppError('Error fetching user', 500));
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res, next) => {
  const { id } = req.params;
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }
  try {
    // Update user profile_image in DB
    const imagePath = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      'UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING id, name, email, role, points, profile_image',
      [imagePath, id]
    );
    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(new AppError('Error uploading profile image', 500));
  }
};

// Get user profile (with image URL)
export const getUserProfile = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, points, profile_image, loyalty_tier, referral_code, referred_by FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(new AppError('Error fetching user profile', 500));
  }
};