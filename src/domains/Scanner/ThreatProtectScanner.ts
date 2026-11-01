import { IScanner, IssuesDetected } from '@/shared/index.js';

export class ThreatProtectScanner implements IScanner {
  scan(filename: string): Promise<IssuesDetected> {
    console.log('ThreatProtectScanner', filename);
    return Promise.resolve(false);
  }
}
