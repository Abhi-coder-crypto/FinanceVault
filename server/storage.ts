import { type User, type InsertUser, type Document, type InsertDocument, type UpdateAdminProfile } from "@shared/schema";
import { getDatabase } from "./db";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export type UserWithoutPassword = Omit<User, 'password'>;

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  getAllClients(): Promise<UserWithoutPassword[]>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(phoneNumber: string, password: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByClient(phoneNumber: string): Promise<Document[]>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
}

// In-memory storage fallback
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private documents: Map<string, Document> = new Map();
  private userIdCounter = 1;
  private docIdCounter = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.phoneNumber === phoneNumber);
  }

  async getAllClients(): Promise<UserWithoutPassword[]> {
    return Array.from(this.users.values())
      .filter(u => u.role === 'client')
      .map(({ password, ...user }) => user);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      _id: String(this.userIdCounter++),
      phoneNumber: insertUser.phoneNumber,
      password: hashedPassword,
      role: insertUser.role,
      name: insertUser.name,
    };
    this.users.set(user._id, user);
    return user;
  }

  async verifyPassword(phoneNumber: string, password: string): Promise<User | null> {
    const user = await this.getUserByPhoneNumber(phoneNumber);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    if (updates.password) {
      updatedUser.password = await bcrypt.hash(updates.password, 10);
    }
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByClient(phoneNumber: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(d => d.clientPhoneNumber === phoneNumber)
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values())
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const doc: Document = {
      _id: String(this.docIdCounter++),
      fileName: insertDoc.fileName,
      clientPhoneNumber: insertDoc.clientPhoneNumber,
      uploadDate: new Date().toISOString(),
      fileSize: insertDoc.fileSize,
      dropboxPath: insertDoc.dropboxPath,
      uploadedBy: insertDoc.uploadedBy,
    };
    this.documents.set(doc._id, doc);
    return doc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }
}

// MongoDB storage
class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const client = await db.collection('clients').findOne({ _id: new ObjectId(id) });
    if (client) {
      return {
        _id: client._id.toString(),
        phoneNumber: client.phoneNumber,
        password: client.password,
        role: 'client' as const,
        name: client.name,
      };
    }
    
    const admin = await db.collection('admin').findOne({ _id: new ObjectId(id) });
    if (admin) {
      return {
        _id: admin._id.toString(),
        phoneNumber: admin.phoneNumber,
        password: admin.password,
        role: 'admin' as const,
        name: admin.name,
      };
    }
    
    return undefined;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const client = await db.collection('clients').findOne({ phoneNumber });
    if (client) {
      return {
        _id: client._id.toString(),
        phoneNumber: client.phoneNumber,
        password: client.password,
        role: 'client' as const,
        name: client.name,
      };
    }
    
    const admin = await db.collection('admin').findOne({ phoneNumber });
    if (admin) {
      return {
        _id: admin._id.toString(),
        phoneNumber: admin.phoneNumber,
        password: admin.password,
        role: 'admin' as const,
        name: admin.name,
      };
    }
    
    return undefined;
  }

  async getAllClients(): Promise<UserWithoutPassword[]> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const clients = await db.collection('clients')
      .find({})
      .sort({ phoneNumber: 1 })
      .toArray();
    
    return clients.map(client => ({
      _id: client._id.toString(),
      phoneNumber: client.phoneNumber,
      role: 'client' as const,
      name: client.name,
    }));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const collectionName = insertUser.role === 'admin' ? 'admin' : 'clients';
    
    const result = await db.collection(collectionName).insertOne({
      phoneNumber: insertUser.phoneNumber,
      password: hashedPassword,
      name: insertUser.name,
    });

    return {
      _id: result.insertedId.toString(),
      phoneNumber: insertUser.phoneNumber,
      password: hashedPassword,
      role: insertUser.role,
      name: insertUser.name,
    };
  }

  async verifyPassword(phoneNumber: string, password: string): Promise<User | null> {
    const user = await this.getUserByPhoneNumber(phoneNumber);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const updateDoc: any = {};
    if (updates.name !== undefined) updateDoc.name = updates.name;
    if (updates.phoneNumber !== undefined) updateDoc.phoneNumber = updates.phoneNumber;
    if (updates.password !== undefined) {
      updateDoc.password = await bcrypt.hash(updates.password, 10);
    }
    
    let result = await db.collection('clients').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );
    
    if (result) {
      return {
        _id: result._id.toString(),
        phoneNumber: result.phoneNumber,
        password: result.password,
        role: 'client' as const,
        name: result.name,
      };
    }
    
    result = await db.collection('admin').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );
    
    if (result) {
      return {
        _id: result._id.toString(),
        phoneNumber: result.phoneNumber,
        password: result.password,
        role: 'admin' as const,
        name: result.name,
      };
    }
    
    return undefined;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const doc = await db.collection('documents').findOne({ _id: new ObjectId(id) });
    if (!doc) return undefined;
    return {
      _id: doc._id.toString(),
      fileName: doc.fileName,
      clientPhoneNumber: doc.clientPhoneNumber,
      uploadDate: doc.uploadDate,
      fileSize: doc.fileSize,
      dropboxPath: doc.dropboxPath,
      uploadedBy: doc.uploadedBy,
    };
  }

  async getDocumentsByClient(phoneNumber: string): Promise<Document[]> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const docs = await db.collection('documents')
      .find({ clientPhoneNumber: phoneNumber })
      .sort({ uploadDate: -1 })
      .toArray();
    
    return docs.map(doc => ({
      _id: doc._id.toString(),
      fileName: doc.fileName,
      clientPhoneNumber: doc.clientPhoneNumber,
      uploadDate: doc.uploadDate,
      fileSize: doc.fileSize,
      dropboxPath: doc.dropboxPath,
      uploadedBy: doc.uploadedBy,
    }));
  }

  async getAllDocuments(): Promise<Document[]> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const docs = await db.collection('documents')
      .find({})
      .sort({ uploadDate: -1 })
      .toArray();
    
    return docs.map(doc => ({
      _id: doc._id.toString(),
      fileName: doc.fileName,
      clientPhoneNumber: doc.clientPhoneNumber,
      uploadDate: doc.uploadDate,
      fileSize: doc.fileSize,
      dropboxPath: doc.dropboxPath,
      uploadedBy: doc.uploadedBy,
    }));
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const result = await db.collection('documents').insertOne({
      fileName: insertDoc.fileName,
      clientPhoneNumber: insertDoc.clientPhoneNumber,
      uploadDate: new Date().toISOString(),
      fileSize: insertDoc.fileSize,
      dropboxPath: insertDoc.dropboxPath,
      uploadedBy: insertDoc.uploadedBy,
    });

    return {
      _id: result.insertedId.toString(),
      fileName: insertDoc.fileName,
      clientPhoneNumber: insertDoc.clientPhoneNumber,
      uploadDate: new Date().toISOString(),
      fileSize: insertDoc.fileSize,
      dropboxPath: insertDoc.dropboxPath,
      uploadedBy: insertDoc.uploadedBy,
    };
  }

  async deleteDocument(id: string): Promise<boolean> {
    const db = await getDatabase();
    if (!db) throw new Error("Database not available");
    
    const result = await db.collection('documents').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
}

// Create storage instance based on database availability
let storageInstance: IStorage | null = null;

export async function getStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  const db = await getDatabase();
  if (db) {
    console.log('✅ Using MongoDB storage');
    storageInstance = new MongoStorage();
  } else {
    console.log('⚠️  Using in-memory storage (data will be lost on restart)');
    storageInstance = new MemStorage();
  }
  
  return storageInstance;
}

// Export a getter function instead of direct instance
export const storage = {
  async getUser(id: string) {
    return (await getStorage()).getUser(id);
  },
  async getUserByPhoneNumber(phoneNumber: string) {
    return (await getStorage()).getUserByPhoneNumber(phoneNumber);
  },
  async getAllClients() {
    return (await getStorage()).getAllClients();
  },
  async createUser(user: InsertUser) {
    return (await getStorage()).createUser(user);
  },
  async verifyPassword(phoneNumber: string, password: string) {
    return (await getStorage()).verifyPassword(phoneNumber, password);
  },
  async updateUser(id: string, updates: Partial<User>) {
    return (await getStorage()).updateUser(id, updates);
  },
  async getDocument(id: string) {
    return (await getStorage()).getDocument(id);
  },
  async getDocumentsByClient(phoneNumber: string) {
    return (await getStorage()).getDocumentsByClient(phoneNumber);
  },
  async getAllDocuments() {
    return (await getStorage()).getAllDocuments();
  },
  async createDocument(doc: InsertDocument) {
    return (await getStorage()).createDocument(doc);
  },
  async deleteDocument(id: string) {
    return (await getStorage()).deleteDocument(id);
  },
};
