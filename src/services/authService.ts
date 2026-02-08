import { UserModel } from '../models/userModel.js';
import bcrypt from 'bcryptjs';

export class AuthService {
  static async register(username: string, password: string, email?: string) {
    return UserModel.create({ username, password, email, isGuest: false });
  }

  static async login(username: string, password: string) {
    const user = await UserModel.findByUsername(username);
    if (user && user.passwordHash && await bcrypt.compare(password, user.passwordHash)) {
      return { success: true, user: { username: user.username, isGuest: false } };
    }
    throw new Error('Invalid credentials');
  }

  static async guestJoin(username: string) {
    return UserModel.create({ username: `guest_${Date.now()}`, isGuest: true });
  }
}