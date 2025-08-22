import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

const router = express.Router();

// In-memory store for unverified users
const unverifiedUsers = new Map();

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup route
router.post('/signup',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  async (req, res) => {
    console.log('🔑 Signup request received');
    console.log('📝 Request body:', JSON.stringify({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password ? '[HIDDEN]' : 'undefined'
    }));
    
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation errors:', errors.array());
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { username, email, password } = req.body;
      console.log('Processing signup for:', { username, email });

      console.log('🔍 Checking for existing user with email:', email);
      const existingUser = await User.findOne({ email }).catch(err => {
        console.error('❌ Database error when checking email:', err);
        throw new Error('Database error when checking email');
      });
      
      if (existingUser) {
        console.log('ℹ️ Found existing user:', {
          email: existingUser.email,
          isVerified: existingUser.isVerified,
          createdAt: existingUser.createdAt
        });
        
        if (existingUser.isVerified) {
          return res.status(400).json({ 
            success: false,
            message: 'Email already in use',
            error: 'EMAIL_EXISTS'
          });
        }
      }
      
      console.log('🔍 Checking for existing username:', username);
      const existingUsername = await User.findOne({ username }).catch(err => {
        console.error('❌ Database error when checking username:', err);
        throw new Error('Database error when checking username');
      });
      
      if (existingUsername) {
        console.log('❌ Username already taken:', username);
        return res.status(400).json({ 
          success: false,
          message: 'Username already taken',
          error: 'USERNAME_TAKEN'
        });
      }
      
      // If email exists in unverified users or in database but not verified, update the verification code
      if (unverifiedUsers.has(email) || (existingUser && !existingUser.isVerified)) {
        console.log('ℹ️ User exists but not verified, generating new verification code');
        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 1);
        
        // If user exists in database but not verified, remove them first
        if (existingUser && !existingUser.isVerified) {
          console.log('🗑️ Removing unverified user from database');
          try {
            await User.deleteOne({ email });
            console.log('✅ Successfully removed unverified user');
          } catch (deleteError) {
            console.error('❌ Error removing unverified user:', deleteError);
            throw new Error('Failed to clean up unverified user');
          }
        }
        
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Store in memory
        unverifiedUsers.set(email, {
          username,
          email,
          password: hashedPassword,
          verificationCode: {
            code: verificationCode,
            expiresAt: verificationExpires
          },
          createdAt: new Date()
        });
        
        console.log('📬 Sending verification email to:', email);
        try {
          await sendVerificationEmail(email, verificationCode);
          console.log('✅ Verification email sent');
          return res.status(200).json({ 
            success: true,
            message: 'A new verification code has been sent to your email',
            email: email 
          });
        } catch (emailError) {
          console.error('❌ Failed to send verification email:', emailError);
          throw new Error('Failed to send verification email');
        }
      }

      console.log('🔐 Generating verification code for new user');
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      try {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Store user data in memory (not in database yet)
        const userData = {
          username,
          email,
          password: hashedPassword,
          verificationCode: {
            code: verificationCode,
            expiresAt: expiresAt
          },
          createdAt: new Date()
        };
        
        // Store with email as key for easy lookup
        unverifiedUsers.set(email, userData);
        console.log('📥 Stored unverified user in memory');
        
        // Set a timeout to clean up unverified users after 1 hour
        setTimeout(() => {
          if (unverifiedUsers.has(email)) {
            unverifiedUsers.delete(email);
            console.log(`🧹 Cleaned up unverified user: ${email}`);
          }
        }, 60 * 60 * 1000); // 1 hour
        
        // Send verification email
        console.log('📬 Sending verification email to:', email);
        try {
          await sendVerificationEmail(email, verificationCode);
          console.log('✅ Verification email sent successfully');
          return res.status(201).json({ 
            success: true,
            message: 'Verification code sent to your email',
            email: email 
          });
        } catch (emailError) {
          console.error('❌ Failed to send verification email:', emailError);
          // Clean up the user data if email sending fails
          unverifiedUsers.delete(email);
          return res.status(500).json({ 
            success: false,
            message: 'Failed to send verification email',
            error: 'EMAIL_SEND_FAILED'
          });
        }
      } catch (error) {
        console.error('❌ Error during user registration:', error);
        return res.status(500).json({
          success: false,
          message: 'An error occurred during registration',
          error: 'REGISTRATION_FAILED',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } catch (error) {
      console.error('❌ Signup error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString()
      });
      
      // Handle specific error types
      let statusCode = 500;
      let errorMessage = 'Server error during signup';
      
      if (error.message.includes('database') || error.name === 'MongoError') {
        statusCode = 503; // Service Unavailable
        errorMessage = 'Database service is currently unavailable';
      } else if (error.message.includes('email')) {
        statusCode = 400;
        errorMessage = 'Invalid email address';
      } else if (error.message.includes('password')) {
        statusCode = 400;
        errorMessage = 'Invalid password';
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: 'SIGNUP_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Verify email route
router.post('/verify-email',
  [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code } = req.body;

      // Find user in unverified users
      const userData = unverifiedUsers.get(email);
      if (!userData) {
        return res.status(404).json({ message: 'User not found or verification expired' });
      }

      // Check verification code
      if (!userData.verificationCode || 
          userData.verificationCode.code !== code || 
          new Date() > userData.verificationCode.expiresAt) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create and save the user to database only after verification
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        isVerified: true
      });

      await user.save();
      
      // Remove from unverified users
      unverifiedUsers.delete(email);

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Server error during verification' });
    }
  }
);

// Login route
router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    console.log('🔑 Login attempt:', { email: req.body.email });
    
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation errors:', errors.array());
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;
      console.log('🔍 Looking up user:', email);

      // Find user by email
      const user = await User.findOne({ email }).select('+password'); // Explicitly include password
      
      if (!user) {
        console.error('❌ User not found:', email);
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        });
      }

      console.log('ℹ️ User found:', {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      });

      // Check if user is verified
      if (!user.isVerified) {
        console.error('❌ User not verified:', email);
        return res.status(401).json({ 
          success: false,
          message: 'Please verify your email before logging in',
          error: 'EMAIL_NOT_VERIFIED'
        });
      }

      console.log('🔑 Verifying password...');
      // Check password using model method
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        console.error('❌ Invalid password for user:', email);
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        });
      }

      console.log('✅ Password verified, generating token...');
      // Generate JWT token using model method
      const token = user.generateAuthToken();
      
      // Get user data without password
      const userData = user.toObject();
      delete userData.password;

      console.log('✅ Login successful for user:', email);
      res.json({ 
        success: true,
        message: 'Login successful',
        token,
        user: userData
      });

    } catch (error) {
      console.error('❌ Login error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        success: false,
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;
