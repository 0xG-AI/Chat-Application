import { db, initDB } from '../../src/models/db';
import { UserModel } from '../../src/models/userModel';
import { RoomModel } from '../../src/models/roomModel';

describe('Models', () => {
  beforeAll(async () => {
    await initDB();
  });

  test('should init DB', async () => {
    expect(db.data).toBeDefined();
    expect(db.data.rooms).toBeDefined();
  });

  test('UserModel create and find', async () => {
    const unique = 'modeltest_' + Date.now();
    const user = await UserModel.create({ username: unique, password: 'pass', isGuest: false });
    expect(user).toHaveProperty('username', unique);
    const found = await UserModel.findByUsername(unique);
    expect(found).toBeDefined();
  });

  test('RoomModel getAll and join', async () => {
    const rooms = await RoomModel.getAll();
    expect(rooms.length).toBeGreaterThan(0);
    const joined = await RoomModel.joinRoom('general', 'testuser', true);
    expect(joined.members).toContain('testuser');
  });
});