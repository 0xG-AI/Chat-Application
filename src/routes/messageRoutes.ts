import { Router } from 'express';
import { MessageController } from '../controllers/messageController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.put('/:id', authenticate, MessageController.edit);
router.delete('/:id', authenticate, MessageController.delete);

export default router;