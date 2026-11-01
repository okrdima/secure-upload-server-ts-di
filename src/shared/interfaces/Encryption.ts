/**
 * Interface for encryption functionality.
 *
 * The Encryption interface defines methods for encrypting and decrypting data.
 *
 * @interface IEncryption
 */
export interface IEncryption {
  /**
   * Encrypts the provided file path using the specified user ID.
   *
   * @param {string} user_id - The ID of the user performing the encryption.
   * @param {string} file_path - The path to the file to be encrypted.
   * @returns {Promise<string>} A promise resolving to the path of the encrypted file.
   */
  encrypt(user_id: string, file_path: string): Promise<string>;

  /**
   * Decrypts the provided encrypted file path using the specified user ID.
   *
   * @param {string} user_id - The ID of the user performing the decryption.
   * @param {string} encrypted_file_path - The path to the encrypted file to be decrypted.
   * @returns {Promise<string>} A promise resolving to the path of the decrypted file.
   */
  decrypt(user_id: string, encrypted_file_path: string): Promise<string>;
}
