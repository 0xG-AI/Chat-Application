import { Router } from 'express';
import { UploadController } from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/image', authenticate, UploadController.uploadImage);

export default router;