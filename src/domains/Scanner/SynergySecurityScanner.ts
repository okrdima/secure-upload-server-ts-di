import { IScanner, IssuesDetected } from '@/shared/index.js';

export class SynergySecurityScanner implements IScanner {
  scan(filename: string): Promise<IssuesDetected> {
    console.log('SynergySecurityScanner', filename);
    return Promise.resolve(false);
  }
}
