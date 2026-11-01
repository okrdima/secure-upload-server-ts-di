import { createReadStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { Attachment, IFileStorage } from '@/shared/index.js';

export class S3Storage implements IFileStorage {
  public constructor(
    private readonly s3: S3Client,
    private readonly bucket: string,
  ) {}

  async upload(attachment: Attachment): Promise<string> {
    const attachmentId = randomUUID();

    const uploads = [this.putStream(`${attachmentId}/original`, attachment.local_path)];

    if (attachment.preview_local_path) {
      uploads.push(this.putStream(`${attachmentId}/preview`, attachment.preview_local_path));
    }

    await Promise.all(uploads);

    return attachmentId;
  }

  async download(
    attachmentId: string,
    variant: 'original' | 'preview' = 'original',
  ): Promise<Readable> {
    const res = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: `${attachmentId}/${variant}`,
      }),
    );

    if (!res.Body) throw new Error(`Attachment ${attachmentId} has no body`);
    return res.Body as Readable; // in Node, Body is an IncomingMessage (Readable)
  }

  private async putStream(key: string, localPath: string): Promise<void> {
    await new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: createReadStream(localPath),
      },
    }).done();
  }
}
