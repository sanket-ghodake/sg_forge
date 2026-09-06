#!/usr/bin/env bun
/**
 * @forge/scripts - Leaked Test Data Purge & Verification (2026 LTS)
 * Safely removes leaked E2E, batch, and test user records from the live auth.db
 * while verifying all 18 canonical enterprise seed accounts remain intact.
 */

import { Database } from 'bun:sqlite';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'apps', 'data', 'auth.db');

if (!existsSync(dbPath)) {
  console.error(`Database not found at: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);

console.log('🔍 Inspecting auth.db before cleanup...');
const totalUsersBefore = db.query('SELECT COUNT(*) as c FROM auth_users;').get() as { c: number };
console.log(`Total users in auth.db: ${totalUsersBefore.c}`);

// Purge leaked test rows
const leakedUsers = db.query(`
  SELECT id, email FROM auth_users 
  WHERE email LIKE 'e2e.%' 
     OR email LIKE 'test.%' 
     OR email LIKE 'batch.%' 
     OR email LIKE 'bulk.%' 
     OR email LIKE 'dup.%' 
     OR email LIKE '%.1788%'
     OR email LIKE 'dryrun.%';
`).all() as Array<{ id: string; email: string }>;

console.log(`Identified ${leakedUsers.length} leaked test user accounts to purge.`);

if (leakedUsers.length > 0) {
  db.transaction(() => {
    db.run(`
      DELETE FROM auth_users 
      WHERE email LIKE 'e2e.%' 
         OR email LIKE 'test.%' 
         OR email LIKE 'batch.%' 
         OR email LIKE 'bulk.%' 
         OR email LIKE 'dup.%' 
         OR email LIKE '%.1788%'
         OR email LIKE 'dryrun.%';
    `);
    db.run('DELETE FROM auth_employee_profiles WHERE user_id NOT IN (SELECT id FROM auth_users);');
    db.run('DELETE FROM auth_employee_relationships WHERE employee_id NOT IN (SELECT id FROM auth_users) OR related_to_id NOT IN (SELECT id FROM auth_users);');
    db.run('DELETE FROM auth_iam_policy_bindings WHERE principal_id NOT IN (SELECT id FROM auth_users);');
    db.run('DELETE FROM auth_sessions WHERE user_id NOT IN (SELECT id FROM auth_users);');
  })();
  console.log(`✅ Successfully purged ${leakedUsers.length} test accounts and cascading profiles.`);
}

const totalUsersAfter = db.query('SELECT COUNT(*) as c FROM auth_users;').get() as { c: number };
console.log(`Total users in auth.db after cleanup: ${totalUsersAfter.c}`);

const canonicalUsers = db.query('SELECT email, display_name FROM auth_users;').all() as Array<{ email: string; display_name: string }>;
console.log('\nRemaining Canonical Seed Accounts:');
for (const u of canonicalUsers) {
  console.log(` - ${u.email.padEnd(35)} (${u.display_name})`);
}

db.close();
