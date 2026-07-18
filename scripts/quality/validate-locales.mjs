/**
 * Locale parity gate:
 * 1. en.json and ar.json expose identical key trees.
 * 2. Every I18N_KEYS leaf exists in both catalogs.
 * 3. Every catalog key is declared in I18N_KEYS (no orphan copy).
 */
import { readdirSync, readFileSync } from 'node:fs';
import process from 'node:process';

const I18N_DIR = 'src/shared/i18n';
const enCatalog = JSON.parse(readFileSync(`${I18N_DIR}/locales/en.json`, 'utf8'));
const arCatalog = JSON.parse(readFileSync(`${I18N_DIR}/locales/ar.json`, 'utf8'));

// Key declarations may be split across module-scoped `*keys.constants.ts` files
// (e.g. practice-keys.constants.ts) so the aggregate catalog stays within its
// size budget; every such file counts as a source of declared keys.
const constantsSource = readdirSync(I18N_DIR)
  .filter((file) => file.endsWith('keys.constants.ts') && !file.endsWith('.test.ts'))
  .map((file) => readFileSync(`${I18N_DIR}/${file}`, 'utf8'))
  .join('\n');

function flattenKeys(tree, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof value === 'string') {
      keys.push(path);
    } else {
      keys.push(...flattenKeys(value, path));
    }
  }
  return keys;
}

const enKeys = new Set(flattenKeys(enCatalog));
const arKeys = new Set(flattenKeys(arCatalog));
const QUOTED_LITERAL = /'([^']+)'/gu;
const KEY_SEGMENT = /^[a-zA-Z0-9]+$/u;

/** A declared key is a quoted literal of 2+ dot-separated alphanumeric segments. */
function isDottedKey(literal) {
  const segments = literal.split('.');
  return segments.length >= 2 && segments.every((segment) => KEY_SEGMENT.test(segment));
}

const declaredKeys = new Set(
  [...constantsSource.matchAll(QUOTED_LITERAL)]
    .map((match) => match[1])
    .filter((literal) => isDottedKey(literal)),
);

const problems = [];
for (const key of enKeys) {
  if (!arKeys.has(key)) {
    problems.push(`ar.json is missing "${key}"`);
  }
  if (!declaredKeys.has(key)) {
    problems.push(`I18N_KEYS does not declare catalog key "${key}"`);
  }
}
for (const key of arKeys) {
  if (!enKeys.has(key)) {
    problems.push(`en.json is missing "${key}"`);
  }
}
for (const key of declaredKeys) {
  if (!enKeys.has(key)) {
    problems.push(`en.json is missing declared key "${key}"`);
  }
}

const emptyValues = flattenKeys(enCatalog).filter((key) => {
  const value = key.split('.').reduce((node, part) => node[part], enCatalog);
  return typeof value === 'string' && value.trim() === '';
});
for (const key of emptyValues) {
  problems.push(`en.json value for "${key}" is empty`);
}

if (problems.length > 0) {
  console.error(`Locale parity gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log(
  `Locale parity gate passed: ${String(enKeys.size)} keys in en/ar with matching I18N_KEYS.`,
);
