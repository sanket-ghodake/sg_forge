/**
 * @forge/scripts - Employee Roster Headless CLI Importer (2026 LTS)
 * Parses and ingests CSV rosters from HRIS exports directly into the central Auth database.
 * @requirements [HLR-AUTH-004] [LLR-PORTAL-005]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAuthDb } from '../apps/src/auth/src/db/db';
import { parseEmployeeCsv, executeBatchImport } from '../apps/src/auth/src/backend/employee-import';
import { createLogger } from '@forge/sdk';

const logger = createLogger('import-employees');

/**
 * runCliImport
 * @requirements [HLR-AUTH-004] [LLR-PORTAL-005]
 */
export function runCliImport(args: string[] = process.argv.slice(2)): { valid: number; invalid: number; dryRun: boolean } {
  const filePath = args.find((a) => !a.startsWith('--'));
  const isDryRun = args.includes('--dry-run');

  if (!filePath) {
    console.error('Usage: rtk bun scripts/import-employees.ts <path/to/roster.csv> [--dry-run]');
    process.exit(1);
  }

  const fullPath = resolve(process.cwd(), filePath);
  if (!existsSync(fullPath)) {
    logger.error(`CSV file not found at: ${fullPath}`);
    process.exit(1);
  }

  logger.info(`Reading CSV roster from ${fullPath} (dry_run: ${isDryRun})...`);
  const rawCsv = readFileSync(fullPath, 'utf8');

  const { records, errors: parseErrors } = parseEmployeeCsv(rawCsv);

  if (parseErrors.length > 0) {
    logger.warn(`Detected ${parseErrors.length} CSV syntax/format warnings:`);
    for (const err of parseErrors.slice(0, 5)) {
      logger.warn(`  Row ${err.row}: ${err.error}`);
    }
  }

  logger.info(`Parsed ${records.length} records. Executing database import...`);
  const db = getAuthDb();

  const result = executeBatchImport(db, records, {
    autoCreateDepartments: true,
    duplicateAction: 'update',
    dryRun: isDryRun,
  });

  if (isDryRun) {
    console.log(`\n[DRY RUN SUMMARY]`);
    console.log(`- Total Records Evaluated: ${records.length}`);
    console.log(`- Valid for Ingestion: ${result.valid}`);
    console.log(`- Invalid / Rejected: ${result.invalid}`);
    console.log(`- New Departments Discovered: ${result.createdDepartments.length} (${result.createdDepartments.join(', ') || 'None'})`);
    if (result.errors.length > 0) {
      console.log(`\nValidation Errors:`);
      for (const err of result.errors.slice(0, 10)) {
        console.log(`  Row ${err.row}: ${err.error}`);
      }
    }
  } else {
    console.log(`\n[IMPORT SUCCESS]`);
    console.log(`- Ingested: ${result.valid} employee records`);
    console.log(`- Skipped / Failed: ${result.invalid} records`);
    console.log(`- Created Departments: ${result.createdDepartments.length}`);
  }

  return { valid: result.valid, invalid: result.invalid, dryRun: isDryRun };
}

if (import.meta.main) {
  try {
    runCliImport();
  } catch (err: any) {
    logger.error('Import failed with exception: ' + err.message);
    process.exit(1);
  }
}
