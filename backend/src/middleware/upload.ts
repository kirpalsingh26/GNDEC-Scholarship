import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

// Explicit set of dangerous executable binary & script extensions that must be blocked for system security
const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.sh',
  '.msi',
  '.com',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.bin',
  '.app',
  '.c',
  '.cpp',
  '.py',
  '.php',
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Guard against malicious executables and script injections
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`Executable or script files (${ext}) are not permitted for security reasons.`)
    );
  }

  // Allow all image formats (JPG, JPEG, PNG, WEBP, BMP, GIF, TIFF, SVG, HEIC, AVIF, JFIF, etc.)
  // and all documents (PDF, Word, Excel, CSV, Text, Scans, etc.)
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB maximum for high-res documents and scans
  },
});
