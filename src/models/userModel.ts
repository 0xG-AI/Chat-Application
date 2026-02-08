import { db, initDB } from './db.js';
import type { User } from '../types/index.js';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(userData: { username: string; password?: string; email?: string; isGuest?: boolean; bio?: string; avatar?: string }) {
    await initDB();
    await db.read();
    if (db.data.users[userData.username]) {
      throw new Error('User already exists');
    }
    const passwordHash = userData.password ? await bcrypt.hash(userData.password, 10) : undefined;
    const user: User = {
      id: 'user_' + Date.now(),
      username: userData.username,
      passwordHash,
      email: userData.email,
      isGuest: userData.isGuest || false,
      joinedAt: new Date().toISOString(),
      bio: userData.bio,
      avatar: userData.avatar
    };
    db.data.users[userData.username] = user;
    await db.write();
    return user;
  }

  static async findByUsername(username: string) {
    await db.read();
    return db.data.users[username];
  }

  static async update(username: string, updates: Partial<User>) {
    await db.read();
    const user = db.data.users[username];
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    if (updates.passwordHash) user.passwordHash = updates.passwordHash; // assume pre-hashed
    await db.write();
    return user;
  }

  static async getAll() {
    await db.read();
    return Object.values(db.data.users);
  }
}