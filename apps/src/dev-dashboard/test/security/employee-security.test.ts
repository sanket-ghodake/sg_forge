/**
 * @forge/dev-dashboard - Employee Security & Zero-Trust Defense Tests (2026 LTS)
 * Tests email validation, duplicate prevention, PII protection, and payload size bounds.
 */

import { afterAll, describe, expect, it } from 'bun:test';
import { employeeController, seedAuthDatabase } from '@forge/auth';

describe('Security: Employee Zero-Trust & PII Defense', () => {
  afterAll(() => {
    seedAuthDatabase(true);
  });
  it('1. Rejects invalid email syntax on creation', () => {
    expect(() => {
      employeeController.createEmployee({
        display_name: 'Invalid Email User',
        email: 'not-an-email',
        job_title: 'Tester',
      });
    }).toThrow(/Invalid email address format/);
  });

  it('2. Prevents duplicate email creation', () => {
    const email = `dup.test.${Date.now()}@forge.internal`;
    employeeController.createEmployee({
      display_name: 'Original User',
      email,
      job_title: 'Original',
    });

    expect(() => {
      employeeController.createEmployee({
        display_name: 'Duplicate User',
        email,
        job_title: 'Duplicate',
      });
    }).toThrow(/already exists/);
  });

  it('3. Guarantees zero password_hash or salt leakage in list queries', () => {
    const res = employeeController.listEmployees({ limit: 10 });
    for (const item of res.items) {
      expect((item as any).password_hash).toBeUndefined();
      expect((item as any).salt).toBeUndefined();
    }
  });

  it('4. Rejects excessively large import batches (>5000 items)', () => {
    const hugeList: any[] = new Array(5001).fill({
      display_name: 'Overflow',
      email: 'test@forge.internal',
    });

    expect(() => {
      employeeController.batchImport(hugeList);
    }).toThrow(/Batch exceeds maximum limit of 5,000 records/);
  });
});
