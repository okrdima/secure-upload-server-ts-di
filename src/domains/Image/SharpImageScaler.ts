import sharp from 'sharp';
import { IImageScaler } from '@/shared/index.js';

export class SharpImageScaler implements IImageScaler {
  async scale(filename: string, max_width: number): Promise<string> {
    const out_file = filename + '.resized.jpg';
    await sharp(filename).resize(max_width).toFile(out_file);

    return out_file;
  }

  supported(mime_type: string): boolean {
    return mime_type == 'image/jpeg' || mime_type == 'image/png' || mime_type == 'image/gif';
  }
}
