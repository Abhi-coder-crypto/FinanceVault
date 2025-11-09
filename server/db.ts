import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectToDatabase(): Promise<Db | null> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI environment variable is not set. Using in-memory storage as fallback.');
    console.warn('⚠️  Please provide MONGODB_URI to use MongoDB for persistent storage.');
    return null;
  }

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️  Falling back to in-memory storage');
    return null;
  }
}

export async function getDatabase(): Promise<Db | null> {
  if (db) {
    return db;
  }
  return await connectToDatabase();
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}
