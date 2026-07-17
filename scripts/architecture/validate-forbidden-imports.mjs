/**
 * Pre-commit fast path: scan STAGED source files for raw vendor imports
 * outside their owners. A cheap subset of validate-package-ownership.mjs.
 */
import { execSync } from 'node:child_process';
import process from 'node:process';

import {
  FOUNDATIONAL_VENDORS,
  findOwnershipEntry,
} from '../../eslint/package-ownership.config.mjs';
import { importSourcesOf, vendorPackageName } from './import-scan.mjs';

const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
  .split('\n')
  .map((line) => line.trim())
  .filter(
    (line) =>
      line.startsWith('src/') &&
      (line.endsWith('.ts') || line.endsWith('.tsx')) &&
      !line.includes('.test.') &&
      !line.startsWith('src/tests/'),
  );

const problems = [];
for (const file of staged) {
  for (const source of importSourcesOf(file)) {
    const vendor = vendorPackageName(source);
    if (vendor === null || FOUNDATIONAL_VENDORS.includes(vendor)) {
      continue;
    }
    const entry = findOwnershipEntry(vendor);
    if (entry === null) {
      problems.push(`${file}: unregistered vendor "${vendor}"`);
      continue;
    }
    const insideOwner = entry.ownerDirs.some((dir) => file.startsWith(`${dir}/`) || file === dir);
    const infraTypeImport =
      (file.startsWith('src/packages/') || file.startsWith('src/platform/')) &&
      source === entry.vendor;
    if (!insideOwner && !infraTypeImport) {
      problems.push(`${file}: raw vendor import "${vendor}" (owner: ${entry.owner})`);
    }
  }
}

if (problems.length > 0) {
  console.error('Forbidden-import gate FAILED:');
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log(`Forbidden-import gate passed (${String(staged.length)} staged files).`);
