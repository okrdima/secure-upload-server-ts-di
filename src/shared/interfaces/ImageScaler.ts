/**
 * Interface for an image scaler.
 *
 * An image scaler is responsible for scaling images.
 */
export interface IImageScaler {
  /**
   * Scales the provided image to the specified maximum width.
   *
   * @param {string} filename - The path to the image file.
   * @param {number} max_width - The maximum width to scale the image to.
   * @returns {Promise<string>} A promise resolving to the path of the scaled image.
   */
  scale(filename: string, max_width: number): Promise<string>;

  /**
   * Checks if the provided image type is supported.
   *
   * @param {string} mime_type - The MIME type of the image.
   * @returns {boolean} True if the image type is supported, false otherwise.
   */
  supported(mime_type: string): boolean;
}
