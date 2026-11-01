import { IPreviewGenerator } from '@/shared/index.js';

export class VideoPreviewGenerator implements IPreviewGenerator {
  generate(filename: string): Promise<string> {
    return Promise.resolve('');
  }
}
