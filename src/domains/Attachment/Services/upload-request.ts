import { IFileStorage, IScanner, IImageScaler, IEncryption, Attachment } from '@/shared/index.js';
import { PreviewGeneratorFactory } from '@/domains/PreviewGenerator/index.js';
import { TempFiles } from '@/helpers/temp-files.js';

export class UploadRequest {
  private readonly IMAGE_MAX_WIDTH_PX: number = 2500;

  constructor(
    private readonly storage: IFileStorage,
    private readonly scanner: IScanner,
    private readonly scaler: IImageScaler,
    private readonly preview_factory: PreviewGeneratorFactory,
    private readonly encryption: IEncryption,
  ) {}

  async upload(attachment: Readonly<Attachment>, mime_type: string): Promise<string> {
    const temp = new TempFiles([attachment.local_path]);

    try {
      await this.assertClean(attachment.local_path);
      const local_path = await this.scaleIfSupported(attachment.local_path, mime_type, temp);
      const preview_local_path = await this.preview(local_path, mime_type, temp);
      const encrypted = await this.encrypt({ ...attachment, local_path, preview_local_path }, temp);

      return await this.storage.upload(encrypted);
    } finally {
      await temp.cleanup();
    }
  }

  private async assertClean(path: string): Promise<void> {
    if (await this.scanner.scan(path)) {
      throw new Error('Virus scanner detected an issue');
    }
  }

  private async scaleIfSupported(
    path: string,
    mime_type: string,
    temp: TempFiles,
  ): Promise<string> {
    if (!this.scaler.supported(mime_type)) return path;

    return temp.add(await this.scaler.scale(path, this.IMAGE_MAX_WIDTH_PX));
  }

  private async preview(path: string, mime_type: string, temp: TempFiles): Promise<string | null> {
    const generator = this.preview_factory.generate(mime_type);
    if (!generator) return null;
    return temp.add(await generator.generate(path));
  }

  private async encrypt(attachment: Attachment, temp: TempFiles): Promise<Attachment> {
    const { user_id, local_path, preview_local_path } = attachment;
    const encrypted = {
      ...attachment,
      local_path: await this.encryptFile(user_id, local_path, temp),
    };

    if (!preview_local_path) return { ...encrypted, preview_local_path: null };

    return {
      ...encrypted,
      preview_local_path: await this.encryptFile(user_id, preview_local_path, temp),
    };
  }

  private async encryptFile(user_id: string, path: string, temp: TempFiles): Promise<string> {
    return temp.add(await this.encryption.encrypt(user_id, path));
  }
}
