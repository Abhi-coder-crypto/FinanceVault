import { getDatabase } from './db';
import { ObjectId } from 'mongodb';

async function migrateUsersToSeparateCollections() {
  console.log('Starting migration from users collection to clients and admin collections...');
  
  const db = await getDatabase();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }

  try {
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    console.log(`Found ${users.length} users to migrate`);

    let clientCount = 0;
    let adminCount = 0;

    for (const user of users) {
      const userData = {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        password: user.password,
        name: user.name,
      };

      if (user.role === 'admin') {
        await db.collection('admin').insertOne(userData);
        adminCount++;
        console.log(`✅ Migrated admin: ${user.phoneNumber}`);
      } else if (user.role === 'client') {
        await db.collection('clients').insertOne(userData);
        clientCount++;
        console.log(`✅ Migrated client: ${user.phoneNumber}`);
      }
    }

    console.log(`\n✅ Migration complete:`);
    console.log(`   - Migrated ${adminCount} admin(s) to 'admin' collection`);
    console.log(`   - Migrated ${clientCount} client(s) to 'clients' collection`);
    console.log(`\n⚠️  Old 'users' collection still exists. You can drop it manually if migration is successful.`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateUsersToSeparateCollections();
