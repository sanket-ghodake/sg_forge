/**
 * @forge-apps/code - Git Sanitizer & Path Traversal Security Tests (Tier 3)
 * OWASP Top 10 & Path Traversal Defense Verification
 */

import { describe, expect, it } from 'bun:test';
import { validateRepoPath } from '../../src/git-sanitizer';

describe('Tier 3 Security: Path Traversal & Repository Sanitization Guard [LLR-SUB-003]', () => {
  it('blocks access to sensitive root system directories (/etc, /root, /sys)', () => {
    const etcTest = validateRepoPath('/etc/passwd');
    expect(etcTest.valid).toBe(false);
    expect(etcTest.error).toContain('protected system directory');

    const rootTest = validateRepoPath('/root/.ssh');
    expect(rootTest.valid).toBe(false);
    expect(rootTest.error).toContain('protected system directory');
  });

  it('rejects relative path traversal escaping into system folders', () => {
    const traversalTest = validateRepoPath('/var/../../etc');
    expect(traversalTest.valid).toBe(false);
  });

  it('rejects directories that are not initialized git repositories', () => {
    const tmpTest = validateRepoPath('/tmp');
    expect(tmpTest.valid).toBe(false);
    expect(tmpTest.error).toContain('not an initialized Git repository');
  });

  it('approves a valid initialized local repository', () => {
    const repoTest = validateRepoPath(process.cwd());
    expect(repoTest.valid).toBe(true);
    expect(repoTest.normalizedPath).toBe(process.cwd());
  });
});
