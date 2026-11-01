import type { Attachment, FileVariant } from '@/shared/types/index.js';
import type { Readable } from 'node:stream';

export interface IFileStorage {
  /**
   * Uploads the provided attachment to storage.
   *
   * @param {Attachment} attachment - The attachment to upload.
   * @returns {Promise<string>} A promise resolving to the upload path.
   */
  upload(attachment: Attachment): Promise<string>;

  /**
   * Downloads the attachment with the provided attachment ID.
   *
   * @param {string} attachment_id - The ID of the attachment to download.
   * @param {'original' | 'preview'} variant - The variant of file to download.
   * @returns {Promise<Readable>} A promise resolving to the downloaded attachment.
   */
  download(attachment_id: string | null, variant?: FileVariant): Promise<Readable>;
}
