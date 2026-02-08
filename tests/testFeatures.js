import axios from 'axios';
import WebSocket from 'ws';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';
let token = ''; // simulate session
async function runTests() {
    console.log('Starting feature tests...');
    // 1. Register user
    try {
        const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
            username: 'testuser',
            password: 'testpass',
            email: 'test@example.com'
        });
        console.log('Register:', regRes.data);
    }
    catch (e) {
        console.log('Register (may exist):', e.response?.data || e.message);
    }
    // 2. Login
    try {
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'testuser',
            password: 'testpass'
        });
        console.log('Login:', loginRes.data);
        // simulate token
        token = 'testuser'; // use for header
    }
    catch (e) {
        console.error('Login failed:', e.response?.data);
    }
    // 3. Get users
    const usersRes = await axios.get(`${BASE_URL}/api/users`);
    console.log('Users:', usersRes.data);
    // 4. Get rooms
    const roomsRes = await axios.get(`${BASE_URL}/api/rooms`);
    console.log('Rooms:', roomsRes.data);
    // 5. Upload image
    const form = new FormData();
    const imagePath = path.join(process.cwd(), 'tests', 'test-image.jpg'); // assume or create dummy
    if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, Buffer.from('dummy image data')); // placeholder
    }
    form.append('image', fs.createReadStream(imagePath), 'test.jpg');
    const uploadRes = await axios.post(`${BASE_URL}/api/upload/image`, form, {
        headers: {
            ...form.getHeaders(),
            'x-username': 'testuser'
        }
    });
    console.log('Upload image:', uploadRes.data);
    const imageUrl = uploadRes.data.url;
    // 6. Get profile
    const profileRes = await axios.get(`${BASE_URL}/api/users/testuser`, {
        headers: { 'x-username': 'testuser' }
    });
    console.log('Profile:', profileRes.data);
    // 7. Update profile
    const updateRes = await axios.put(`${BASE_URL}/api/users/testuser`, { bio: 'Test bio' }, {
        headers: { 'x-username': 'testuser' }
    });
    console.log('Update profile:', updateRes.data);
    // 8. WS test
    console.log('Testing WS...');
    const ws = new WebSocket(WS_URL);
    ws.on('open', () => {
        console.log('WS connected');
        // join as guest public
        ws.send(JSON.stringify({ type: 'join', username: 'testguest', isGuest: true, room: 'general' }));
        // send message
        setTimeout(() => {
            ws.send(JSON.stringify({ type: 'message', username: 'testguest', content: 'Hello WS', room: 'general' }));
        }, 500);
        // send image
        setTimeout(() => {
            ws.send(JSON.stringify({ type: 'image', username: 'testguest', url: imageUrl, room: 'general' }));
            ws.close();
        }, 1000);
    });
    ws.on('message', (data) => console.log('WS msg:', data.toString()));
    ws.on('close', () => console.log('WS closed'));
    console.log('All tests initiated. Check console for WS/events.');
}
runTests().catch(console.error);
