import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import searchRoutes from './routes/search.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import geminiService from './services/geminiService.js';
import { auth } from './middleware/auth.js';

// Load environment variables
dotenv.config();

// MongoDB connection state
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // Keep connection alive for 45s
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB with retry logic
const connectDB = async (retry = false) => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cookiepedia';
  
  if (isConnected) {
    console.log('ℹ️ Using existing MongoDB connection');
    return mongoose.connection;
  }

  if (retry) {
    retryCount++;
    if (retryCount > MAX_RETRIES) {
      console.error(`❌ Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
      process.exit(1);
    }
    console.log(`🔄 Attempting to reconnect to MongoDB (${retryCount}/${MAX_RETRIES})...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  } else {
    console.log('🔌 Attempting to connect to MongoDB...');
  }
  
  // Log connection attempt (masking password)
  const maskedURI = mongoURI.replace(/(mongodb:\/\/[^:]+:)([^@]+)/, '$1*****');
  console.log('📡 Connection string:', maskedURI);
  
  try {
    const conn = await mongoose.connect(mongoURI, mongoOptions);
    isConnected = true;
    retryCount = 0;
    
    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('📂 Database:', conn.connection.name);
    
    // List collections
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log('👥 Collections:', collections.map(c => c.name).join(', '));
    } catch (err) {
      console.warn('⚠️ Could not list collections:', err.message);
    }
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('🔗 MongoDB connection is open');
      isConnected = true;
    });
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
      isConnected = false;
      // Attempt to reconnect on error
      if (!retry) connectDB(true);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB connection disconnected');
      isConnected = false;
      // Attempt to reconnect when disconnected
      if (!retry) connectDB(true);
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('👋 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (retry) {
      console.log(`⏳ Retrying in ${RETRY_DELAY/1000} seconds...`);
      return connectDB(true);
    }
    
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if MongoDB is running');
    console.error('2. Verify the connection string in .env is correct');
    console.error('3. Check network connectivity to MongoDB');
    console.error('4. Verify MongoDB user permissions');
    console.error('5. Check if MongoDB port is accessible');
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\n🔍 Debug Info:');
      console.error('- Node.js Version:', process.version);
      console.error('- Mongoose Version:', require('mongoose/package.json').version);
      console.error('- Environment:', process.env.NODE_ENV);
      console.error('- Connection String:', mongoURI);
    }
    
    // Don't exit in development to allow for auto-restart with nodemon
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
    
    throw error;
  }
};

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Public Routes
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Protected Routes (require authentication)
app.get('/api/protected', auth, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.user
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cookiepedia Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cookiepedia Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Search API: http://localhost:${PORT}/api/search`);
  
  // Check Gemini API configuration
  if (geminiService.isConfigured()) {
    console.log(`🤖 Gemini AI integration: ENABLED`);
    console.log(`✨ Smart recipe suggestions powered by Google Gemini`);
  } else {
    console.log(`⚠️  Gemini AI integration: DISABLED`);
    console.log(`💡 Add GEMINI_API_KEY to .env file to enable AI-powered suggestions`);
    console.log(`📝 Using fallback local search for now`);
  }
});

export default app;
