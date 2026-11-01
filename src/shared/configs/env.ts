// config/env.ts
import { z } from 'zod';
import { StorageType } from '@/shared/types/index.js';

const base = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(25 * 1024 * 1024),
  UPLOAD_TMP_DIR: z.string().default('/tmp/uploads'),
  ENCRYPTION_KEY: z.string().optional(),
  KEY_SERVICE_URL: z.string().url().optional(),
});

const s3 = base.extend({
  STORAGE: z.literal(StorageType.S3),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

const sftp = base.extend({
  STORAGE: z.literal(StorageType.SFTP),
  SFTP_HOST: z.string().min(1),
  SFTP_PORT: z.coerce.number().default(22),
  SFTP_USERNAME: z.string().min(1),
  SFTP_PRIVATE_KEY_PATH: z.string().min(1),
  SFTP_REMOTE_ROOT: z.string().default('upload'),
});

const schema = z.discriminatedUnion('STORAGE', [s3, sftp]).superRefine((env, ctx) => {
  // key checks, same as before
  if (env.NODE_ENV === 'production') {
    if (!env.KEY_SERVICE_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['KEY_SERVICE_URL'],
        message: 'is required in production',
      });
    }
  } else if (!env.ENCRYPTION_KEY || Buffer.from(env.ENCRYPTION_KEY, 'base64').length !== 32) {
    ctx.addIssue({
      code: 'custom',
      path: ['ENCRYPTION_KEY'],
      message: 'must be 32 random bytes, base64-encoded (openssl rand -base64 32)',
    });
  }
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    console.error(`Invalid environment configuration:\n${lines.join('\n')}`);
    process.exit(1);
  }
  return result.data;
}

export const env: Env = loadEnv(); // runs once, at first import
