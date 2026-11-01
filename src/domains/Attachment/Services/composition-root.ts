import { env } from '@/shared/configs/index.js';
import {
  KeyStoreFactory,
  AesEncryption,
  ThreatProtectScanner,
  SynergySecurityScanner,
  StorageFactory,
  SharpImageScaler,
} from '@/domains/index.js';
import {
  PreviewGeneratorFactory,
  DocumentPreviewGenerator,
  VideoPreviewGenerator,
  ImagePreviewGenerator,
  AudioPreviewGenerator,
} from '@/domains/PreviewGenerator/index.js';
import { UploadRequest } from '../Services/upload-request.js';

export function buildContainer() {
  const isProduction = env.NODE_ENV === 'production';

  // --- encryption ---
  const encryption = new AesEncryption(new KeyStoreFactory().create());

  // --- scanning and images ---
  const virusScanner = isProduction ? new ThreatProtectScanner() : new SynergySecurityScanner();
  const imageScaler = new SharpImageScaler();

  // --- previews ---
  const previewFactory = new PreviewGeneratorFactory();

  const image = new ImagePreviewGenerator(imageScaler);
  for (const type of ['image/jpeg', 'image/gif', 'image/png', 'image/bmp']) {
    previewFactory.register(type, image);
  }

  const document = new DocumentPreviewGenerator();
  for (const type of ['application/pdf', 'text/plain']) {
    previewFactory.register(type, document);
  }

  const video = new VideoPreviewGenerator();
  for (const type of ['video/mp4', 'video/webm']) {
    previewFactory.register(type, video);
  }

  const audio = new AudioPreviewGenerator();
  for (const type of ['audio/aac', 'audio/mpeg', 'audio/ogg']) {
    previewFactory.register(type, audio);
  }

  // --- storage (clients are created once, here) ---
  const storageFactory = new StorageFactory();

  const storage = storageFactory.create_storage();

  const request = new UploadRequest(storage, virusScanner, imageScaler, previewFactory, encryption);

  return { request };
}

export type Container = ReturnType<typeof buildContainer>;
