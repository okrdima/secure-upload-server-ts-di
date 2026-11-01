import { IPreviewGenerator } from '@/shared/index.js';

export class PreviewGeneratorFactory {
  private readonly generators: { [mimeType: string]: IPreviewGenerator } = {};
  register(mimeType: string, generator: IPreviewGenerator) {
    this.generators[mimeType] = generator;
  }
  generate(mimeType: string): IPreviewGenerator | null {
    return this.generators[mimeType] || null;
  }
}
