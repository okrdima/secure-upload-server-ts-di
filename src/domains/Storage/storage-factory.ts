import { readFileSync } from 'node:fs';
import { S3Client } from '@aws-sdk/client-s3';
import { env as appEnv, type Env } from '@/shared/configs/env.js';
import type { IFileStorage } from '@/shared/index.js';
import { StorageType } from '@/shared/index.js';
import { SftpStorage } from './SftpStorage.js';
import { S3Storage } from './AWSStorage.js';

export class StorageFactory {
  private base?: IFileStorage; // built once, reused

  constructor(private readonly env: Env = appEnv) {}

  create_storage(): IFileStorage {
    this.base ??= this.createBase();
    return this.base;
  }

  private createBase(): IFileStorage {
    const env = this.env;
    switch (env.STORAGE) {
      case StorageType.S3:
        return new S3Storage(
          new S3Client({
            endpoint: env.S3_ENDPOINT,
            region: env.S3_REGION,
            forcePathStyle: env.S3_FORCE_PATH_STYLE,
            credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
          }),
          env.S3_BUCKET,
        );
      case StorageType.SFTP:
        return new SftpStorage({
          host: env.SFTP_HOST,
          port: env.SFTP_PORT,
          username: env.SFTP_USERNAME,
          privateKey: readFileSync(env.SFTP_PRIVATE_KEY_PATH, 'utf8'),
          remoteRoot: env.SFTP_REMOTE_ROOT,
        });
      default: {
        const unreachable: never = env; // compile error if you add a type and forget a case
        throw new Error(`Unknown storage: ${JSON.stringify(unreachable)}`);
      }
    }
  }
}
