import { Request, Response } from 'express';
import { upload } from '../middlewares/upload.js';

export class UploadController {
  static uploadImage = [
    upload.single('image'),
    (req: Request, res: Response) => {
      if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' });
        return;
      }
      const fileUrl = `/uploads/images/${req.file.filename}`;
      res.json({ success: true, url: fileUrl });
    }
  ];
}