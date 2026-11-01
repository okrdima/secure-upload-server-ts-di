import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import type { Env } from '@/shared/configs/index.js';

export function createUploadMiddleware(env: Env, allowedMimeTypes?: Set<string>) {
  mkdirSync(env.UPLOAD_TMP_DIR, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: env.UPLOAD_TMP_DIR,
      // never use the client's file name on disk
      filename: (_req, _file, cb) => cb(null, randomUUID()),
    }),
    limits: {
      fileSize: env.MAX_UPLOAD_BYTES,
      files: 1,
      fields: 10,
    },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes && !allowedMimeTypes.has(file.mimetype)) {
        return cb(new Error(`Unsupported file type: ${file.mimetype}`));
      }
      cb(null, true);
    },
  });
}
