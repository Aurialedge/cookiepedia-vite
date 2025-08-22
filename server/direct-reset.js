const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://saperkar1862004:Shangcoeus1862004@cluster0.wlfne9v.mongodb.net/';
const USER_EMAIL = 'saperkar1862004@gmail.com';
const NEW_PASSWORD = 'Pass1234';

async function resetPassword() {
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('test');
    const users = db.collection('users');

    // Find the user
    const user = await users.findOne({ email: USER_EMAIL });
    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('🔍 Found user:', {
      email: user.email,
      isVerified: user.isVerified,
      passwordHash: user.password ? '********' : 'MISSING',
      passwordLength: user.password?.length || 0
    });

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

    // Update the user
    const result = await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          isVerified: true
        }
      }
    );

    console.log('✅ Password updated successfully!');
    console.log('New password:', NEW_PASSWORD);
    console.log('Update result:', result);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetPassword();
