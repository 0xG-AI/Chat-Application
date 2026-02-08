import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', UserController.getAll);
router.get('/:username', authenticate, UserController.getProfile);
router.put('/:username', authenticate, UserController.updateProfile);

export default router;