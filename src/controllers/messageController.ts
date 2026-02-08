import { Request, Response } from 'express';
import { db } from '../models/db.js';
import type { ChatMessage } from '../types/index.js';

export class MessageController {
  static async edit(req: Request, res: Response) {
    const { id } = req.params;
    const { content } = req.body;
    await db.read();
    const msg = db.data.messages.find((m: any) => m.id === id) as ChatMessage;
    if (!msg || msg.username !== (req as any).user.username) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    msg.content = content;
    msg.edited = true;
    await db.write();
    res.json({ success: true, message: msg });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await db.read();
    const msg = db.data.messages.find((m: any) => m.id === id) as ChatMessage;
    if (!msg || msg.username !== (req as any).user.username) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    msg.deleted = true;
    msg.content = '[deleted]';
    await db.write();
    res.json({ success: true });
  }
}