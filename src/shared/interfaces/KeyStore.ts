/**
 * Interface for a key store.
 *
 * A key store is responsible for storing and retrieving encryption keys.
 */
export interface IKeyStore {
  /**
   * Retrieves the encryption key for the specified user.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<string>} A promise resolving to the encryption key.
   */
  key_for_user(userId: string): Promise<string>;
}
