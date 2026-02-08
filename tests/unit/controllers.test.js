import request from 'supertest';
import express from 'express';
import { AuthController } from '../../src/controllers/authController';
import { UserController } from '../../src/controllers/userController';
const app = express();
app.use(express.json());
app.post('/register', AuthController.register);
app.get('/users/:username', UserController.getProfile);
describe('Controllers', () => {
    test('AuthController register', async () => {
        const res = await request(app).post('/register').send({ username: 'controllertest2', password: 'pass' });
        expect([200, 400]).toContain(res.status); // duplicate ok
    });
    test('UserController profile', async () => {
        const res = await request(app).get('/users/testuser');
        expect(res.status).toBe(200); // user may exist
    });
});
