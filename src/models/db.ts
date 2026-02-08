import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { DBData, ChatEvent } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dataDir = join(__dirname, '../../data');
const dbFile = join(dataDir, 'db.json');
const adapter = new JSONFile<DBData>(dbFile);
const defaultData: DBData = { 
  users: {}, 
  messages: [], 
  rooms: {
    'general': { id: 'general', name: 'General', isPrivate: false, members: [], createdAt: new Date().toISOString() },
    'random': { id: 'random', name: 'Random', isPrivate: false, members: [], createdAt: new Date().toISOString() },
    'private-dev': { id: 'private-dev', name: 'Private Dev', isPrivate: true, members: [], createdAt: new Date().toISOString() }
  }, 
  events: [] 
};
export const db = new Low<DBData>(adapter, defaultData);

export async function initDB() {
  await db.read();
  if (!db.data) db.data = defaultData;
  await db.write();
}

export async function saveEvent(type: string, data: any, username?: string, clientId?: string) {
  const event: ChatEvent = {
    type,
    timestamp: new Date().toISOString(),
    username,
    data,
    clientId
  };
  db.data.events.push(event);
  await db.write();
}

export async function getAllUsers() {
  await db.read();
  return db.data.users;
}

export async function getAllMessages() {
  await db.read();
  return db.data.messages;
}

export async function getAllEvents() {
  await db.read();
  return db.data.events;
}