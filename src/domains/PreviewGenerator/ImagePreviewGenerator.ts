import { IPreviewGenerator, IImageScaler } from '@/shared/index.js';

export class ImagePreviewGenerator implements IPreviewGenerator {
  private readonly scaler: IImageScaler;
  private readonly MAX_WIDTH_PX: number = 250;

  constructor(scaler: IImageScaler) {
    this.scaler = scaler;
  }

  generate(filename: string): Promise<string> {
    return this.scaler.scale(filename, this.MAX_WIDTH_PX);
  }
}
