import { IPreviewGenerator } from '@/shared/index.js';

export class AudioPreviewGenerator implements IPreviewGenerator {
  generate(filename: string): Promise<string> {
    return Promise.resolve('');
  }
}
