import { AuthService } from '../../src/services/authService';
import { UserService } from '../../src/services/userService';
import { RoomService } from '../../src/services/roomService';

describe('Services', () => {
  test('AuthService register/login', async () => {
    const unique = 'servicetest_' + Date.now();
    await expect(AuthService.register(unique, 'pass123')).resolves.toBeDefined();
    await expect(AuthService.login(unique, 'pass123')).resolves.toBeDefined();
  });

  test('UserService profile', async () => {
    await UserService.updateProfile('servicetest', { bio: 'test bio' });
    const profile = await UserService.getProfile('servicetest');
    expect(profile.bio).toBe('test bio');
  });

  test('RoomService', async () => {
    const rooms = await RoomService.getAvailableRooms();
    expect(rooms.length).toBeGreaterThan(0);
  });
});