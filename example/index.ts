import { ChatSDK } from '../dist/sdk.js'; // after build
import WebSocket from 'ws';

async function demo() {
  console.log('Demo SDK Chat...');

  // Init SDK with config
  const sdk = new ChatSDK({
    port: 4000,
    dbPath: './example.db.json',
    uploadLimitMB: 2,
    uploadsDir: './uploads'
  });

  await sdk.start();

  // Use SDK methods
  try {
    const user = await sdk.register('exampleuser', 'pass123', 'ex@example.com');
    console.log('Registered:', user);
  } catch (e) {
    console.log('Register (exists):', e);
  }

  const login = await sdk.login('exampleuser', 'pass123');
  console.log('Logged in:', login);

  // WS demo
  const ws = new WebSocket('ws://localhost:4000');
  ws.on('open', () => {
    ws.send(JSON.stringify({ type: 'join', username: 'exampleuser', room: 'general' }));
    ws.send(JSON.stringify({ type: 'message', username: 'exampleuser', content: 'SDK demo msg', room: 'general' }));
    setTimeout(() => ws.close(), 1000);
  });
  ws.on('message', (data) => console.log('WS:', data.toString()));
}

demo().catch(console.error);