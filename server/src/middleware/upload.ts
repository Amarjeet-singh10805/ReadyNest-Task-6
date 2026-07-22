import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { cloudinaryV2 } from '../config/cloudinary';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP and PDF files are allowed'));
    }
  },
});

export const uploadToCloudinary = (fieldName: string) => [
  upload.single(fieldName),
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) return next();
    try {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinaryV2.uploader.upload_stream(
          { folder: 'hms', resource_type: 'auto' },
          (err, result) => {
            if (err || !result) return reject(err);
            resolve(result as { secure_url: string });
          }
        );
        stream.end(req.file!.buffer);
      });
      (req.file as Express.Multer.File & { path: string }).path = result.secure_url;
      next();
    } catch (err) {
      next(err);
    }
  },
];