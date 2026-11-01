import type { Request, Response } from 'express';
import type { Attachment } from '@/shared/index.js';
import type { Container } from '../Services/composition-root.js';
import { removeFiles } from '@/helpers/remove-files.js';

export function createUploadController(deps: Container) {
  const { request } = deps;

  return async function handleUploadAttachment(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        data: null,
        error: 'No file uploaded',
        message: "Please upload a file using the 'file' field",
      });
    }

    try {
      const userId = req.body.user_id?.toString();
      if (!userId) {
        return res.status(401).json({
          data: null,
          error: 'Unauthorized',
          message: 'User is not authenticated',
        });
      }

      const attachment: Attachment = {
        preview_local_path: null,
        local_path: file.path,
        user_id: userId,
        attachment_id: null,
      };

      const attachmentId = await request.upload(attachment, file.mimetype);

      return res.status(200).json({
        data: { attachmentId },
        error: null,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      console.error('Upload failed', error); // keep the details in the log
      return res.status(500).json({
        data: null,
        error: 'Upload failed',
        message: 'File uploading failed',
      });
    } finally {
      // runs on success and on failure
      await removeFiles([file.path]);
    }
  };
}
