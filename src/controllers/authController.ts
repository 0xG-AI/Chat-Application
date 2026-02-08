import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
      }
      const user = await AuthService.register(username, password, email);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login(username, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}