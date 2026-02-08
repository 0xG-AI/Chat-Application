import { RoomModel } from '../models/roomModel.js';

export class RoomService {
  static async getAvailableRooms() {
    return RoomModel.getAll();
  }

  static async getJoinedRooms(username: string) {
    return RoomModel.getUserRooms(username);
  }

  static async joinRoom(roomId: string, username: string, isAuthenticated: boolean = false) {
    return RoomModel.joinRoom(roomId, username, isAuthenticated);
  }
}