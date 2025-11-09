import { getDatabase } from './db';

async function checkDatabaseCollections() {
  console.log('Checking database collections...\n');
  
  const db = await getDatabase();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }

  try {
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    console.log('\n=== ADMIN collection ===');
    const admins = await db.collection('admin').find({}).toArray();
    console.log(`Found ${admins.length} admin(s):`);
    admins.forEach(admin => {
      console.log(`  - Phone: ${admin.phoneNumber}, Name: ${admin.name || 'N/A'}`);
    });
    
    console.log('\n=== CLIENTS collection ===');
    const clients = await db.collection('clients').find({}).toArray();
    console.log(`Found ${clients.length} client(s):`);
    clients.forEach(client => {
      console.log(`  - Phone: ${client.phoneNumber}, Name: ${client.name || 'N/A'}`);
    });
    
    console.log('\n=== DOCUMENTS collection ===');
    const documents = await db.collection('documents').find({}).toArray();
    console.log(`Found ${documents.length} document(s):`);
    documents.forEach(doc => {
      console.log(`  - File: ${doc.fileName}, Client: ${doc.clientPhoneNumber}`);
    });
    
    console.log('\n✅ Database structure verified successfully!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkDatabaseCollections();
