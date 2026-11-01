import { IPreviewGenerator } from '@/shared/index.js';

export class DocumentPreviewGenerator implements IPreviewGenerator {
  generate(filename: string): Promise<string> {
    return Promise.resolve('');
  }
}
