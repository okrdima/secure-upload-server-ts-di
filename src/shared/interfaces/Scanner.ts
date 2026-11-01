import { IssuesDetected } from '@/shared/types/index.js';

/**
 * Interface for a scanner.
 *
 * A scanner is responsible for scanning files for potential security threats.
 *
 * @interface IScanner
 */
export interface IScanner {
  /**
   * Scans the provided file for potential security threats.
   *
   * @param {string} filename - The path to the file to scan.
   * @returns {Promise<boolean>} A promise resolving to a boolean indicating whether issues were detected.
   */
  scan(filename: string): Promise<IssuesDetected>;
}
