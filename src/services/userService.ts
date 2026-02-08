import { UserModel } from '../models/userModel.js';

export class UserService {
  static async getProfile(username: string) {
    const user = await UserModel.findByUsername(username);
    if (!user) throw new Error('User not found');
    // omit sensitive
    const { passwordHash, ...profile } = user;
    return profile;
  }

  static async updateProfile(username: string, updates: { bio?: string; avatar?: string; email?: string }) {
    const user = await UserModel.findByUsername(username);
    if (!user) throw new Error('User not found');
    return UserModel.update(username, updates);
  }

  static async getAllUsers() {
    return UserModel.getAll();
  }
}