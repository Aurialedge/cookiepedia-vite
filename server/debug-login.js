import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saperkar1862004:Shangcoeus1862004@cluster0.wlfne9v.mongodb.net/';
const TEST_EMAIL = 'saperkar1862004@gmail.com';
const TEST_PASSWORD = 'Pass1234';

async function debugLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // 1. Find the user
    console.log('\n🔍 Looking for user:', TEST_EMAIL);
    const user = await User.findOne({ email: TEST_EMAIL });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      passwordHash: user.password ? '********' : 'MISSING',
      passwordLength: user.password ? user.password.length : 0,
      passwordStartsWith: user.password ? user.password.substring(0, 10) + '...' : 'N/A'
    });

    // 2. Check verification status
    if (!user.isVerified) {
      console.log('⚠️  User is not verified. Updating to verified...');
      user.isVerified = true;
      await user.save();
      console.log('✅ User marked as verified');
    }

    // 3. Test password comparison
    console.log('\n🔑 Testing password comparison...');
    console.log('  - Provided password:', TEST_PASSWORD);
    
    // Direct bcrypt comparison
    console.log('\n🔄 Direct bcrypt comparison:');
    const directMatch = await bcrypt.compare(TEST_PASSWORD, user.password);
    console.log('  - Direct match result:', directMatch);

    // Using model method
    console.log('\n🔄 Using model comparePassword method:');
    const modelMatch = await user.comparePassword(TEST_PASSWORD);
    console.log('  - Model method match result:', modelMatch);

    // 4. If password doesn't match, let's reset it
    if (!directMatch) {
      console.log('\n🔄 Resetting password to known value...');
      const newHash = await bcrypt.hash(TEST_PASSWORD, 10);
      user.password = newHash;
      await user.save();
      console.log('✅ Password has been reset');
      console.log('New hash:', newHash);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugLogin();
