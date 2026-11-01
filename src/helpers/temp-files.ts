import { removeFiles } from './remove-files.js';

/** Collects the files one operation creates, so they can be removed together. */
export class TempFiles {
  private readonly paths: string[] = [];

  // `keep` lists paths that must never be deleted (the caller's own files)
  constructor(private readonly keep: string[] = []) {}

  add(path: string): string {
    if (!this.keep.includes(path)) this.paths.push(path);
    return path; // returns the path, so you can wrap a call: temp.add(await ...)
  }

  cleanup(): Promise<void> {
    return removeFiles(this.paths);
  }
}
