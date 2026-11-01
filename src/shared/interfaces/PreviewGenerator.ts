/**
 * Interface for a preview generator.
 *
 * A preview generator is responsible for generating previews of images.
 */
export interface IPreviewGenerator {
  /**
   * Generates a preview of the provided image.
   *
   * @param {string} filename - The path to the image file.
   * @returns {Promise<string>} A promise resolving to the path of the generated preview.
   */
  generate(filename: string): Promise<string>;
}
