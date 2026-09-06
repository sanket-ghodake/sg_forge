/**
 * @forge/scripts - 52-Member CRO Organization Hierarchy Seeder (2026 LTS)
 * Populates realistic 4-tier deep Go-To-Market & Revenue structure rooted at Chief Revenue Officer (CRO).
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAuthDb } from '../apps/src/auth/src/db/db';
import { executeBatchImport, type BatchImportRecord } from '../apps/src/auth/src/backend/employee-import';
import { createLogger } from '@forge/sdk';

const logger = createLogger('seed-cro-org');

/**
 * seedCroOrganization
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function seedCroOrganization(): void {
  const jsonPath = join(process.cwd(), 'samples', 'test-org-cro-52-employees.json');
  if (!existsSync(jsonPath)) {
    logger.error('CRO test dataset not found at ' + jsonPath);
    process.exit(1);
  }

  const raw = readFileSync(jsonPath, 'utf8');
  const records = JSON.parse(raw) as BatchImportRecord[];

  logger.info(`Starting seeding of ${records.length} CRO hierarchy records...`);

  const db = getAuthDb();

  try {
    // Purge old transient test rows and orphaned dummy records
    db.run("DELETE FROM auth_users WHERE email LIKE '%.1788%' OR email LIKE 'batch.%' OR email LIKE 'bulk%' OR email LIKE 'test.%' OR email LIKE 'e2e.%' OR email LIKE 'dup.%';");
    db.run("DELETE FROM auth_employee_profiles WHERE user_id NOT IN (SELECT id FROM auth_users);");
    db.run("DELETE FROM auth_employee_relationships WHERE employee_id NOT IN (SELECT id FROM auth_users) OR related_to_id NOT IN (SELECT id FROM auth_users);");
    db.run("DELETE FROM auth_iam_policy_bindings WHERE principal_id NOT IN (SELECT id FROM auth_users);");

    const result = executeBatchImport(db, records, {
      autoCreateDepartments: true,
      duplicateAction: 'update',
      dryRun: false,
    });

    logger.info(`✅ Successfully seeded CRO organization: ${result.valid} valid records (${result.invalid} invalid), ${result.createdDepartments.length} new departments.`);
    console.log('\n🌳 Seeded CRO Organization Tree Structure:');
    console.log('└─ Elena Rostova (CRO / Chief Revenue Officer)');
    console.log('   ├─ Marcus Thorne (VP of Global Enterprise Sales) [18 Direct & Indirect Reports]');
    console.log('   ├─ Sophia Mercer (VP of Marketing & Brand Growth) [8 Direct & Indirect Reports]');
    console.log('   ├─ David Kalu (VP of Customer Success & Renewals) [10 Direct & Indirect Reports]');
    console.log('   ├─ Aria Sterling (VP of Revenue Operations & Strategy) [5 Direct & Indirect Reports]');
    console.log('   └─ Liam O\'Connor (VP of Solutions Engineering & GTM) [4 Direct & Indirect Reports]');
    console.log(`\nTotal members: ${records.length}\n`);
  } catch (err: any) {
    logger.error('Failed to seed CRO organization: ' + err.message);
    throw err;
  }
}

if (import.meta.main) {
  seedCroOrganization();
}
