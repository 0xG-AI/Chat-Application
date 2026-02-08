import { db, initDB } from './db.js';
import type { Room } from '../types/index.js';

export class RoomModel {
  static async getAll() {
    await db.read();
    return Object.values(db.data.rooms);
  }

  static async getUserRooms(username: string) {
    await db.read();
    return Object.values(db.data.rooms).filter(room => room.members.includes(username));
  }

  static async joinRoom(roomId: string, username: string, isAuthenticated: boolean = false) {
    await db.read();
    const room = db.data.rooms[roomId];
    if (!room) throw new Error('Room not found');
    if (room.isPrivate && !isAuthenticated) {
      throw new Error('Private room requires authentication');
    }
    if (!room.members.includes(username)) {
      room.members.push(username);
      await db.write();
    }
    return room;
  }

  static async getRoom(roomId: string) {
    await db.read();
    return db.data.rooms[roomId];
  }
}