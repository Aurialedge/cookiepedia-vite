import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function resetPassword(email, newPassword) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cookiepedia', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 Searching for user:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log('🔄 Updating password for:', user.email);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password updated successfully');
    console.log('New hash:', hashedPassword.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node reset-password.js <email> <newPassword>');
  process.exit(1);
}

resetPassword(email, password);
