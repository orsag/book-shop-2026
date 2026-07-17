// src/routes/uploads.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsService } from '../services/uploads.service';

const router = Router();
const uploadsService = new UploadsService();

// 1. Configure Multer Storage
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadLocation = process.env['UPLOAD_LOCATION'];
    if (!uploadLocation) {
      return cb(new Error('UPLOAD_LOCATION is not defined in environment variables'), '');
    }
    cb(null, uploadLocation);
  },
  filename: (req, file, cb) => {
    // Create a unique name: timestamp + random + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

// 2. Configure Multer File Filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!')); // Pass standard error
  }
  cb(null, true);
};

// 3. Initialize Multer instance
const upload = multer({
  storage,
  fileFilter,
});

// Helper middleware to catch generic Multer parsing errors cleanly
const uploadSingleImage = (req: Request, res: Response, next: NextFunction) => {
  const uploadHandler = upload.single('file'); // Matches 'file' interceptor key

  uploadHandler(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
    return;
  });
};

// 4. POST /uploads/image
router.post('/image', uploadSingleImage, async (req: Request, res: Response) => {
  try {
    const file = req.file; // Populated by multer

    if (!file) {
      res.status(400).json({ message: 'File is required' });
      return;
    }

    // Save metadata to Postgres via the decoupled service
    const result = await uploadsService.saveImageData(file.filename);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

export const uploadsRouter = router;