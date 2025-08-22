const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://saperkar1862004:Shangcoeus1862004@cluster0.wlfne9v.mongodb.net/';
const USER_EMAIL = 'saperkar1862004@gmail.com';
const NEW_PASSWORD = 'NewSecurePass123!';

async function fixLogin() {
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('test');
    const users = db.collection('users');

    // 1. Find the user
    console.log('\n🔍 Finding user:', USER_EMAIL);
    const user = await users.findOne({ email: USER_EMAIL });
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified
    });

    // 2. Generate new password hash
    console.log('\n🔑 Generating new password hash...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
    console.log('New hash generated');

    // 3. Update the user
    console.log('\n🔄 Updating user in database...');
    const result = await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          isVerified: true
        }
      }
    );

    console.log('\n✅ Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    // 4. Verify the update
    console.log('\n🔍 Verifying update...');
    const updatedUser = await users.findOne({ _id: user._id });
    console.log('Updated user:', {
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
      passwordStartsWith: updatedUser.password.substring(0, 10) + '...'
    });

    console.log('\n✅ Login with:');
    console.log(`Email: ${USER_EMAIL}`);
    console.log(`Password: ${NEW_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixLogin();