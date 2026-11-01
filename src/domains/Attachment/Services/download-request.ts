import { unlink } from 'node:fs/promises';
import type { Readable } from 'node:stream';
import type { Attachment, IEncryption, IFileStorage, FileVariant } from '@/shared/index.js';
import { createReadStream, createWriteStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';

export class DownloadRequest {
  constructor(
    private readonly storage: IFileStorage,
    private readonly encryption: IEncryption,
    private readonly tempDir: string,
  ) {}

  async download(
    attachment: Attachment,
    userId: string,
    variant: FileVariant = 'original',
  ): Promise<Readable> {
    const encPath = join(this.tempDir, `${randomUUID()}.enc`);
    let plainPath = encPath.slice(0, -'.enc'.length);

    const cleanup = () =>
      Promise.all([unlink(encPath), unlink(plainPath)].map((p) => p.catch(() => {})));

    try {
      // 1. fetch the ciphertext into a temp file
      const source = await this.storage.download(attachment.attachment_id, variant);
      await pipeline(source, createWriteStream(encPath));

      // 2. decrypt and verify the auth tag (this fails for a wrong user or a changed file)
      plainPath = await this.encryption.decrypt(userId, encPath);
    } catch (err) {
      await cleanup();
      throw err;
    }

    // 3. hand out the plaintext, and delete both temp files when the stream is closed
    const stream = createReadStream(plainPath);
    stream.once('close', () => void cleanup());
    return stream;
  }
}
