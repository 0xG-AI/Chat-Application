import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { setupWebSocket } from './websocket/chat.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { initDB } from './models/db.js';
import type { DBData } from './types/index.js';

export interface SDKConfig {
  port?: number;
  dbPath?: string;
  uploadLimitMB?: number;
  uploadsDir?: string;
}

export class ChatSDK {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer;
  private config: SDKConfig;

  constructor(config: SDKConfig = {}) {
    this.config = {
      port: config.port || 3000,
      dbPath: config.dbPath || join(dirname(fileURLToPath(import.meta.url)), '../data/db.json'),
      uploadLimitMB: config.uploadLimitMB || 5,
      uploadsDir: config.uploadsDir || 'uploads/images'
    };
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.setup();
  }

  private setup() {
    this.app.use(express.json());
    this.app.use('/uploads', express.static(this.config.uploadsDir!));

    // Routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/rooms', roomRoutes);
    this.app.use('/api/upload', uploadRoutes);

    this.app.get('/', (req, res) => res.json({ status: 'SDK Chat Server running' }));

    this.app.use(errorHandler);

    // WS
    setupWebSocket(this.wss);
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, () => {
        console.log(`SDK Chat Server running on port ${this.config.port}`);
        resolve(true);
      });
    });
  }

  // Exposed SDK methods (proxy to features)
  async register(username: string, password: string, email?: string) {
    // call internal or http, but for SDK direct
    const { AuthService } = await import('./services/authService.js');
    return AuthService.register(username, password, email);
  }

  async login(username: string, password: string) {
    const { AuthService } = await import('./services/authService.js');
    return AuthService.login(username, password);
  }

  async editMessage(id: string, content: string, username: string) {
    // proxy to WS or DB
    const { db } = await import('./models/db.js');
    await db.read();
    const msg = db.data.messages.find((m: any) => m.id === id) as any;
    if (msg && msg.username === username) {
      msg.content = content;
      msg.edited = true;
      await db.write();
      return msg;
    }
    throw new Error('Not authorized');
  }

  async deleteMessage(id: string, username: string) {
    const { db } = await import('./models/db.js');
    await db.read();
    const msg = db.data.messages.find((m: any) => m.id === id) as any;
    if (msg && msg.username === username) {
      msg.deleted = true;
      msg.content = '[deleted]';
      await db.write();
      return true;
    }
    throw new Error('Not authorized');
  }

  // more proxies
}