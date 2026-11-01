import { randomUUID } from 'node:crypto';
import { PassThrough, type Readable } from 'node:stream';
import { posix } from 'node:path';
import SftpClient from 'ssh2-sftp-client';
import type { Attachment, IFileStorage, SftpStorageOptions } from '@/shared/index.js';

export class SftpStorage implements IFileStorage {
  private readonly remoteRoot: string;

  public constructor(private readonly options: SftpStorageOptions) {
    this.remoteRoot = options.remoteRoot ?? '.';
  }

  async upload(attachment: Attachment): Promise<string> {
    const attachmentId = randomUUID();
    const dir = posix.join(this.remoteRoot, attachmentId);

    await this.withClient(async (client) => {
      await client.mkdir(dir, true);
      await client.fastPut(attachment.local_path, posix.join(dir, 'original'));

      if (attachment.preview_local_path) {
        await client.fastPut(attachment.preview_local_path, posix.join(dir, 'preview'));
      }
    });

    return attachmentId;
  }

  async download(
    attachmentId: string,
    variant: 'original' | 'preview' = 'original',
  ): Promise<Readable> {
    const client = await this.connect();
    const remotePath = posix.join(this.remoteRoot, attachmentId, variant);
    const stream = new PassThrough();

    // Don't await: the caller gets the stream immediately and data flows into it.
    client
      .get(remotePath, stream)
      .catch((err) => stream.destroy(err))
      .finally(() => client.end().catch(() => {}));

    return stream;
  }

  private async connect(): Promise<SftpClient> {
    const client = new SftpClient();
    await client.connect({
      host: this.options.host,
      port: this.options.port,
      username: this.options.username,
      privateKey: this.options.privateKey,
    });
    return client;
  }

  private async withClient<T>(fn: (client: SftpClient) => Promise<T>): Promise<T> {
    const client = await this.connect();
    try {
      return await fn(client);
    } finally {
      await client.end();
    }
  }
}
