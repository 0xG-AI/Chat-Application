import { Router } from 'express';
import { RoomController } from '../controllers/roomController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', RoomController.getAll);
router.get('/user/:username', authenticate, RoomController.getUserJoined);

export default router;