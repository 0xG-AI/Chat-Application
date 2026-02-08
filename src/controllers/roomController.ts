import { Request, Response } from 'express';
import { RoomService } from '../services/roomService.js';

export class RoomController {
  static async getAll(req: Request, res: Response) {
    try {
      const rooms = await RoomService.getAvailableRooms();
      res.json(rooms);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUserJoined(req: Request, res: Response) {
    try {
      const username = req.params.username || (req as any).user?.username;
      const rooms = await RoomService.getJoinedRooms(username);
      res.json(rooms);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }
}