import WebSocket, { WebSocketServer } from 'ws';
import { db, saveEvent, initDB } from '../models/db.js';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/userModel.js';
import { RoomModel } from '../models/roomModel.js';
import type { ChatMessage } from '../types/index.js';

export function setupWebSocket(wss: WebSocketServer) {
  // room to clients map for targeted broadcast
  const roomClients = new Map<string, Set<WebSocket>>();

  function broadcastToRoom(data: any, roomId: string) {
    const msg = JSON.stringify(data);
    const clients = roomClients.get(roomId) || new Set();
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  function broadcast(data: any) {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  wss.on('connection', (ws: any) => {
    const clientId = Math.random().toString(36).substring(7);
    console.log('Client connected', clientId);
    ws.clientId = clientId;

    ws.on('message', async (message: any) => {
      const msgStr = message.toString();
      let parsed;
      try {
        parsed = JSON.parse(msgStr);
      } catch {
        parsed = { type: 'message', content: msgStr };
      }

      const username = parsed.username || 'anonymous';
      await saveEvent(parsed.type || 'unknown', parsed, username, clientId);
      const roomId = parsed.room || 'general';

      if (parsed.type === 'join') {
        const isGuest = parsed.isGuest || !parsed.password;
        let user;
        let authenticated = !isGuest;

        if (isGuest) {
          user = await UserModel.create({ username: `guest_${Date.now()}`, isGuest: true });
          authenticated = false;
        } else if (parsed.password) {
          user = await UserModel.findByUsername(username);
          if (user?.passwordHash) {
            authenticated = await bcrypt.compare(parsed.password, user.passwordHash);
          }
        }

        try {
          await RoomModel.joinRoom(roomId, username, authenticated);
          ws.currentRoom = roomId;
          if (!roomClients.has(roomId)) roomClients.set(roomId, new Set());
          roomClients.get(roomId)!.add(ws);

          if (user) {
            await UserModel.update(username || user.username, { 
              id: clientId, 
              room: roomId, 
              joinedAt: new Date().toISOString(),
              isOnline: true 
            });
          }
          await initDB();

          const joinMsg = { type: 'system', content: `${username} joined`, room: roomId, id: Date.now().toString() };
          db.data.messages.push(joinMsg);
          await db.write();

          broadcastToRoom({ type: 'user_joined', username, room: roomId }, roomId);
          broadcastToRoom(joinMsg, roomId);
          broadcast({ type: 'users', users: Object.values(db.data.users) });
          broadcast({ type: 'online_status', username, status: true });
        } catch (err: any) {
          ws.send(JSON.stringify({ type: 'error', content: err.message }));
        }
      } else if (parsed.type === 'message' || parsed.type === 'image') {
        const chatMsg: any = { 
          id: Date.now().toString(),
          type: parsed.type, 
          username, 
          content: parsed.content, 
          url: parsed.url, 
          room: roomId, 
          timestamp: new Date().toISOString() 
        };
        db.data.messages.push(chatMsg);
        await db.write();
        broadcastToRoom(chatMsg, roomId);
      } else if (parsed.type === 'edit') {
        const msg = db.data.messages.find((m: any) => m.id === parsed.id) as any;
        if (msg && msg.username === username) {
          msg.content = parsed.content;
          msg.edited = true;
          await db.write();
          broadcastToRoom({ type: 'message_edited', id: parsed.id, content: parsed.content, room: roomId }, roomId);
        }
      } else if (parsed.type === 'delete') {
        const msg = db.data.messages.find((m: any) => m.id === parsed.id) as any;
        if (msg && msg.username === username) {
          msg.deleted = true;
          msg.content = '[deleted]';
          await db.write();
          broadcastToRoom({ type: 'message_deleted', id: parsed.id, room: roomId }, roomId);
        }
      } else if (parsed.type === 'typing') {
        broadcastToRoom({ type: 'typing', username, isTyping: parsed.isTyping, room: roomId }, roomId);
      } else if (parsed.type === 'leave') {
        delete db.data.users[username];
        await db.write();
        const leaveMsg = { type: 'system', content: `${username} left`, room: roomId, id: Date.now().toString() };
        db.data.messages.push(leaveMsg);
        await db.write();
        broadcastToRoom(leaveMsg, roomId);
        if (ws.currentRoom) {
          const clients = roomClients.get(ws.currentRoom);
          if (clients) clients.delete(ws);
        }
        broadcast({ type: 'online_status', username, status: false });
      } else {
        broadcast(parsed);
      }
    });

    ws.on('close', async () => {
      console.log('Client disconnected', clientId);
      await saveEvent('disconnect', {}, undefined, clientId);
      if (ws.currentRoom) {
        const clients = roomClients.get(ws.currentRoom);
        if (clients) clients.delete(ws);
      }
      // set offline
      const user = Object.values(db.data.users).find((u: any) => u.id === clientId);
      if (user) {
        user.isOnline = false;
        await db.write();
        broadcast({ type: 'online_status', username: user.username, status: false });
      }
    });
  });
}