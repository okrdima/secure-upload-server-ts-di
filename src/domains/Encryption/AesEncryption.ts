import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { open, stat, unlink } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import type { IKeyStore, IEncryption } from '@/shared/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended size for GCM
const TAG_LENGTH = 16;

export class AesEncryption implements IEncryption {
  constructor(private readonly keystore: IKeyStore) {}

  private async getKey(userId: string): Promise<Buffer> {
    const rawKey = await this.keystore.key_for_user(userId);
    // Derive a 32-byte key bound to this purpose. Assumes rawKey is random, not a password.
    return Buffer.from(hkdfSync('sha256', rawKey, '', `file-encryption:${userId}`, 32));
  }

  async encrypt(userId: string, filePath: string): Promise<string> {
    const key = await this.getKey(userId);
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const outPath = `${filePath}.enc`;

    async function* encrypted() {
      yield iv;
      for await (const chunk of createReadStream(filePath)) {
        yield cipher.update(chunk);
      }
      yield cipher.final();
      yield cipher.getAuthTag();
    }

    try {
      await pipeline(encrypted(), createWriteStream(outPath));
      return outPath;
    } catch (err) {
      await unlink(outPath).catch(() => {});
      throw err;
    }
  }

  async decrypt(userId: string, encryptedPath: string): Promise<string> {
    const key = await this.getKey(userId);
    const { size } = await stat(encryptedPath);
    if (size <= IV_LENGTH + TAG_LENGTH) {
      throw new Error('Encrypted file is too short or empty');
    }

    // Read the IV from the start and the tag from the end.
    const iv = Buffer.alloc(IV_LENGTH);
    const tag = Buffer.alloc(TAG_LENGTH);
    const fh = await open(encryptedPath, 'r');
    try {
      await fh.read(iv, 0, IV_LENGTH, 0);
      await fh.read(tag, 0, TAG_LENGTH, size - TAG_LENGTH);
    } finally {
      await fh.close();
    }

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const outPath = encryptedPath.endsWith('.enc')
      ? encryptedPath.slice(0, -4)
      : `${encryptedPath}.dec`;

    try {
      await pipeline(
        createReadStream(encryptedPath, { start: IV_LENGTH, end: size - TAG_LENGTH - 1 }),
        decipher,
        createWriteStream(outPath),
      );
      return outPath;
    } catch (err) {
      // GCM verifies the tag only at the end, so remove the partial output on failure.
      await unlink(outPath).catch(() => {});
      throw err;
    }
  }
}
