import { KeyService } from './KeyService.js';
import { StaticKeyStore } from './StaticKeyStore.js';
import { IKeyStore } from '@/shared/interfaces/index.js';
import { env as appEnv, type Env } from '@/shared/configs/env.js';

export class KeyStoreFactory {
  constructor(private readonly env: Env = appEnv) {}

  create(): IKeyStore {
    return this.env.NODE_ENV === 'production'
      ? new KeyService(this.env.KEY_SERVICE_URL!)
      : new StaticKeyStore(this.env.ENCRYPTION_KEY!);
  }
}
