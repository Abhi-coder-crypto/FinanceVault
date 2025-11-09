import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// todo: This will be replaced with MongoDB implementation
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const _id = randomUUID();
    const user: User = { ...insertUser, _id };
    this.users.set(_id, user);
    return user;
  }
}

export const storage = new MemStorage();
