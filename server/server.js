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

// Connect to MongoDB
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cookiepedia';
  console.log('Attempting to connect to MongoDB at:', mongoURI);
  
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    // Verify the connection
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
      console.log('MongoDB connected successfully to database:', db.name);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.error('Please make sure:');
    console.error('1. MongoDB is running');
    console.error('2. The connection string in .env is correct');
    console.error('3. The MongoDB service has started');
    process.exit(1);
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
