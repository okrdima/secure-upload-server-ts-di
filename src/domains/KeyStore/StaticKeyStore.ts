import type { IKeyStore } from '@/shared/index.js';

export class StaticKeyStore implements IKeyStore {
  private readonly key: string;

  constructor(key: string) {
    if (Buffer.from(key, 'base64').length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 random bytes, base64-encoded');
    }
    this.key = key;
  }

  key_for_user(_userId: string): Promise<string> {
    return Promise.resolve(this.key);
  }
}
