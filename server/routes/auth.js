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
    console.log('Signup request received:', { body: req.body });
    
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;
      console.log('Processing signup for:', { username, email });

      // Check if email is already verified in database
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.isVerified) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Check if username is taken in database
      const existingUsername = await User.findOne({ username });
      console.log('Existing username check:', { username, exists: !!existingUsername });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // If email exists in unverified users or in database but not verified, update the verification code
      if (unverifiedUsers.has(email) || (existingUser && !existingUser.isVerified)) {
        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date();
        verificationExpires.setHours(verificationExpires.getHours() + 1);
        
        // If user exists in database but not verified, remove them first
        if (existingUser && !existingUser.isVerified) {
          await User.deleteOne({ email });
        }
        
        unverifiedUsers.set(email, {
          username,
          email,
          password, // In a real app, make sure to hash this
          verificationCode: {
            code: verificationCode,
            expiresAt: verificationExpires
          },
          username,
          password,
          createdAt: new Date()
        });
        
        // Resend verification email
        await sendVerificationEmail(email, verificationCode);
        console.log('Generated verification code:', { verificationCode, expiresAt: verificationExpires });
        return res.status(200).json({ 
          message: 'A new verification code has been sent to your email',
          email: email 
        });
      }

      // Generate verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      console.log('Generated verification code:', { verificationCode, expiresAt });

      // Store user data in memory (not in database yet)
      const userData = {
        username,
        email,
        password, // In a real app, you should hash the password before saving
        verificationCode: {
          code: verificationCode,
          expiresAt: expiresAt
        },
        createdAt: new Date()
      };
      
      // Store with email as key for easy lookup
      unverifiedUsers.set(email, userData);
      
      // Set a timeout to clean up unverified users after 1 hour
      setTimeout(() => {
        if (unverifiedUsers.has(email)) {
          unverifiedUsers.delete(email);
          console.log(`Cleaned up unverified user: ${email}`);
        }
      }, 60 * 60 * 1000); // 1 hour

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationCode);
        res.status(201).json({ 
          message: 'Verification code sent to your email',
          email: email 
        });
      } catch (error) {
        // If email fails to send, clean up
        unverifiedUsers.delete(email);
        console.error('Error sending verification email:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error during signup' });
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
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in' });
      }

      // Check password using model method
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Generate JWT token using model method
      const token = user.generateAuthToken();

      res.json({ 
        success: true,
        message: 'Login successful',
        token,
        user
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;
