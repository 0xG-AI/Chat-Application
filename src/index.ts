import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { initDB } from './models/db.js';
import { setupWebSocket } from './websocket/chat.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Root
app.get('/', (req, res) => {
  res.json({ status: 'Chat server running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Messages/events (public)
app.get('/api/messages', async (req, res) => {
  const { getAllMessages } = await import('./models/db.js');
  res.json(await getAllMessages());
});

app.get('/api/events', async (req, res) => {
  const { getAllEvents } = await import('./models/db.js');
  res.json(await getAllEvents());
});

// Error middleware
app.use(errorHandler);

// Setup WS
setupWebSocket(wss);

async function startServer() {
  await initDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);