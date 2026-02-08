# Real-time Chat Backend

Node.js + Express + WebSockets (ws) + TypeScript + LowDB (FS KV) + Multer (images) chat server with MVP architecture.

## Project Structure
- `src/types/`: All interfaces (User, Room, ChatEvent, DBData, ChatMessage)
- `src/models/`: DB setup, User/Room models
- `src/services/`: Business logic (Auth, User, Room)
- `src/controllers/`: Request handlers
- `src/routes/`: API routes
- `src/middlewares/`: Auth, upload, error
- `src/websocket/`: WS setup and events
- `tests/`: Feature test script + Postman collection
- `uploads/images/`: FS storage for images
- `data/db.json`: KV DB

## Available Endpoints
- GET / : Server status
- POST /api/auth/register : {username, password, email?}
- POST /api/auth/login : {username, password}
- GET /api/users : List users
- GET /api/users/:username : Profile (auth header x-username)
- PUT /api/users/:username : Update profile {bio, avatar, email} (auth)
- GET /api/rooms : List all rooms (public/private)
- GET /api/rooms/user/:username : User joined rooms (auth)
- POST /api/upload/image : Upload image (multipart, auth, 5MB limit)

## WebSocket Events (connect to ws://localhost:3000)
- join: {type: 'join', username, password?, isGuest?, room?} - auth for private
- message: {type: 'message', username, content, room?}
- image: {type: 'image', username, url, room?} - after upload
- leave: {type: 'leave', username}
- Responses: system messages, user_joined, users list, errors; room-targeted broadcast

## Setup & Run
- `npm install`
- `npm run dev` (nodemon + ts-node ESM)
- `npm run build && npm start`
- `npm run test:features` (runs HTTP/WS/upload tests; server must be running)
- Images: served at /uploads/images/...

## Testing
- Postman collection: tests/chat.postman_collection.json (import to Postman; run login first for session vars; WS manual)
- Test script: tests/testFeatures.ts (axios + ws + upload)
- Example app: example/index.ts (run with `ts-node --esm example/index.ts` after build; demos SDK)

See code for more. All data in FS DB.