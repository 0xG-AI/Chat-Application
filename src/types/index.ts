export interface ChatEvent {
  type: string;
  timestamp: string;
  username?: string;
  data: any;
  clientId?: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  email?: string;
  isGuest: boolean;
  room?: string;
  joinedAt: string;
  bio?: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  members: string[];
  createdAt: string;
}

export interface DBData {
  users: Record<string, User>;
  messages: Array<{ type: string; username?: string; content?: string; room?: string; timestamp?: string }>;
  rooms: Record<string, Room>;
  events: ChatEvent[];
}

export interface ChatMessage {
  id?: string;
  type: string;
  username?: string;
  content?: string;
  url?: string;
  room?: string;
  timestamp?: string;
  edited?: boolean;
  deleted?: boolean;
}