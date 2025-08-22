import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cookiepedia';

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Collections:', collections.map(c => c.name));
    
    // Check if users collection exists
    if (collections.some(c => c.name === 'users')) {
      console.log('👥 Found users collection');
      
      // Count users
      const userCount = await User.countDocuments();
      console.log(`👤 Total users in database: ${userCount}`);
      
      // List first 5 users (without passwords)
      const users = await User.find({}).select('-password').limit(5);
      console.log('📋 Sample users:');
      console.log(users);
    } else {
      console.log('❌ Users collection not found');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

testConnection();
