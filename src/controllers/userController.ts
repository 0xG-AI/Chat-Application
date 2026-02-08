import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const username = req.params.username || (req as any).user?.username;
      const profile = await UserService.getProfile(username);
      res.json(profile);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const username = req.params.username || (req as any).user?.username;
      const updates = req.body;
      const updated = await UserService.updateProfile(username, updates);
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}