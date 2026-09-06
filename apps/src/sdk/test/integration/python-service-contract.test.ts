/**
 * @forge/sdk - Tier 2 Integration: Polyglot Python Service Contract
 */

import { describe, expect, it } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Tier 2 Integration: Polyglot External Service Specification', () => {
  it('should maintain valid Python FastAPI sample reading injected gateway headers', () => {
    const pyFile = join(process.cwd(), 'samples', 'external-python-service', 'main.py');
    expect(existsSync(pyFile)).toBe(true);

    const content = readFileSync(pyFile, 'utf8');
    expect(content).toContain('x_forwarded_user');
    expect(content).toContain('x_forwarded_role');
    expect(content).toContain('/health');
    expect(content).toContain('/api/ai/predict');
  });
});
