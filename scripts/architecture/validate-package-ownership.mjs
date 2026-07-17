/**
 * Package ownership gate:
 * 1. Every runtime dependency in package.json is either foundational,
 *    registered in eslint/package-ownership.config.mjs, or explicitly
 *    tooling-only.
 * 2. No src file imports a registered vendor outside its owner dirs.
 * 3. Every registered owner directory exists.
 */
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

import {
  FOUNDATIONAL_VENDORS,
  PACKAGE_OWNERSHIP,
  findOwnershipEntry,
} from '../../eslint/package-ownership.config.mjs';
import { walkFiles } from '../quality/file-walk.mjs';
import { importSourcesOf, vendorPackageName } from './import-scan.mjs';

const TYPE_IMPORT_STATEMENT = /^\s*import\s+type\s[^;]*?from\s+['"]([^'"]+)['"]/gmu;

/**
 * Infrastructure layers may reference a vendor's types without owning it
 * (erased at build time). True only when EVERY import of the vendor in the
 * file is type-only.
 */
function importsVendorTypeOnly(file, vendor) {
  const content = readFileSync(file, 'utf8');
  const typeOnlySources = new Set(
    [...content.matchAll(TYPE_IMPORT_STATEMENT)].map((match) => vendorPackageName(match[1])),
  );
  if (!typeOnlySources.has(vendor)) {
    return false;
  }
  const valueImports = importSourcesOf(file).filter(
    (source) => vendorPackageName(source) === vendor,
  );
  const typeImportCount = [...content.matchAll(TYPE_IMPORT_STATEMENT)].filter(
    (match) => vendorPackageName(match[1]) === vendor,
  ).length;
  return valueImports.length === typeImportCount;
}

const problems = [];

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
for (const dependency of Object.keys(packageJson.dependencies ?? {})) {
  if (FOUNDATIONAL_VENDORS.includes(dependency)) {
    continue;
  }
  if (findOwnershipEntry(dependency) === null) {
    problems.push(`dependency "${dependency}" has no owner in package-ownership.config.mjs`);
  }
}

for (const entry of PACKAGE_OWNERSHIP) {
  for (const ownerDir of entry.ownerDirs) {
    if (!existsSync(ownerDir)) {
      problems.push(`owner dir "${ownerDir}" for vendor "${entry.vendor}" does not exist`);
    }
  }
}

const sourceFiles = walkFiles('src', { extensions: ['.ts', '.tsx'] }).filter(
  (file) => !file.includes('.test.') && !file.startsWith('src/tests/'),
);
for (const file of sourceFiles) {
  for (const source of importSourcesOf(file)) {
    const vendor = vendorPackageName(source);
    if (vendor === null || FOUNDATIONAL_VENDORS.includes(vendor)) {
      continue;
    }
    const entry = findOwnershipEntry(vendor);
    if (entry === null) {
      problems.push(`${file}: imports unregistered vendor "${vendor}"`);
      continue;
    }
    const insideOwner = entry.ownerDirs.some((dir) => file === dir || file.startsWith(`${dir}/`));
    if (!insideOwner) {
      const infraLayer = file.startsWith('src/packages/') || file.startsWith('src/platform/');
      if (!(infraLayer && importsVendorTypeOnly(file, vendor))) {
        problems.push(`${file}: imports vendor "${vendor}" outside owner (${entry.owner})`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`Package ownership gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log(
  `Package ownership gate passed: ${String(PACKAGE_OWNERSHIP.length)} vendors, ${String(sourceFiles.length)} source files scanned.`,
);
