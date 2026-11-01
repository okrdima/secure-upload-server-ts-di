import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { env } from '@/shared/configs/env.js';
import { createUploadMiddleware } from '@/shared/middleware/upload.js';
import { createUploadController, buildContainer } from '@/domains/Attachment/index.js';
import cors from 'cors';

const container = buildContainer();
const upload = createUploadMiddleware(env);
const port = process.env.port || 3000;

const app = express();
// Use CORS middleware to allow all origins
app.use(
  cors({
    origin: '*',
  }),
);

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// multer errors (file too large and so on) end up here
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ data: null, error: err.code, message: err.message });
  }
  console.error(err);
  return res
    .status(500)
    .json({ data: null, error: 'Internal error', message: 'Something went wrong' });
});

// Route: /attachment
// Using 'file' as the field name for the upload
app.post('/attachments', upload.single('file'), createUploadController(container));

// Route: /health-check
app.get('/health-check', (req: Request, res: Response) => {
  res.status(200).json({
    data: null,
    error: null,
    message: 'Server working',
  });
});

app.listen(env.PORT, () => console.log(`Server is running at http://localhost:${port}`));
