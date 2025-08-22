import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = 'mongodb+srv://saperkar1862004:Shangcoeus1862004@cluster0.wlfne9v.mongodb.net/';
const USER_EMAIL = 'saperkar1862004@gmail.com';
const NEW_PASSWORD = 'NewSecurePass123!';

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: USER_EMAIL });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('🔍 Found user:', {
      email: user.email,
      isVerified: user.isVerified
    });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
    
    // Update the password
    user.password = hashedPassword;
    user.isVerified = true; // Ensure the user is verified
    await user.save();

    console.log('✅ Password updated successfully!');
    console.log('New password:', NEW_PASSWORD);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

resetPassword();
