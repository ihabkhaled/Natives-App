/**
 * Filename taxonomy gate: every file under src/ (excluding src/tests) must
 * carry an approved kind suffix or exact name, and use kebab-case.
 * --staged limits the check to staged files (pre-commit).
 */
import { execSync } from 'node:child_process';
import process from 'node:process';

import { EXACT_FILE_KINDS, FILE_SUFFIX_KINDS } from '../../eslint/filenames.config.mjs';
import { walkFiles } from './file-walk.mjs';

const LOWER_ALPHANUMERIC = /^[a-z0-9]+$/u;
const CHECKED_EXTENSION_NAMES = ['ts', 'tsx', 'json', 'css'];

/** Kebab-case: dash-separated lowercase words, no empty/leading/trailing dash. */
function isKebabSegment(segment) {
  const words = segment.split('-');
  return words.every((word) => LOWER_ALPHANUMERIC.test(word));
}

/** Kebab-case every dot-separated segment (linear scan; no nested quantifiers). */
function isKebabFilename(base) {
  const segments = base.split('.');
  const extension = segments.pop();
  if (extension === undefined || !CHECKED_EXTENSION_NAMES.includes(extension)) {
    return false;
  }
  return segments.length > 0 && segments.every((segment) => isKebabSegment(segment));
}

/** Only code and asset files carry the kind taxonomy; docs are prose. */
const CHECKED_EXTENSIONS = ['.ts', '.tsx', '.json', '.css'];

function listTargetFiles() {
  if (process.argv.includes('--staged')) {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.startsWith('src/') &&
          !line.startsWith('src/tests/') &&
          CHECKED_EXTENSIONS.some((extension) => line.endsWith(extension)),
      );
  }
  return walkFiles('src', { extensions: CHECKED_EXTENSIONS }).filter(
    (file) => !file.startsWith('src/tests/'),
  );
}

function violationFor(file) {
  const base = file.slice(file.lastIndexOf('/') + 1);
  if (!isKebabFilename(base)) {
    return 'not kebab-case';
  }
  if (base.endsWith('.json') || base.endsWith('.css')) {
    return null;
  }
  if (base.includes('.test.')) {
    return null;
  }
  if (EXACT_FILE_KINDS[base] !== undefined) {
    return null;
  }
  const suffixMatch = /\.([a-z-]+)\.(ts|tsx)$/u.exec(base);
  if (
    suffixMatch !== null &&
    FILE_SUFFIX_KINDS[`${suffixMatch[1]}.${suffixMatch[2]}`] !== undefined
  ) {
    return null;
  }
  return 'unknown file kind (see eslint/filenames.config.mjs taxonomy)';
}

const violations = [];
for (const file of listTargetFiles()) {
  const problem = violationFor(file);
  if (problem !== null) {
    violations.push(`${file}: ${problem}`);
  }
}

if (violations.length > 0) {
  console.error(`Filename gate FAILED (${String(violations.length)}):`);
  for (const violation of violations) {
    console.error(`  ${violation}`);
  }
  process.exit(1);
}
console.log('Filename gate passed.');
