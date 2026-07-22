/**
 * Locale parity gate:
 * 1. Neither catalog declares the same key twice (JSON.parse hides duplicates).
 * 2. en.json and ar.json expose the same key families.
 * 3. A plural family carries exactly the CLDR categories its language needs
 *    (en: one/other; ar: zero/one/two/few/many/other).
 * 4. Every I18N_KEYS leaf exists as a family in both catalogs.
 * 5. Every catalog family is declared in I18N_KEYS (no orphan/stale copy).
 * 6. No empty copy in either language — `ar` is never left behind.
 * 7. Interpolation placeholders match between the two languages.
 */
import { readdirSync, readFileSync } from 'node:fs';
import process from 'node:process';

const I18N_DIR = 'src/shared/i18n';
const SOURCE_LOCALE = 'en';
const TARGET_LOCALE = 'ar';

const rawCatalogs = {
  [SOURCE_LOCALE]: readFileSync(`${I18N_DIR}/locales/${SOURCE_LOCALE}.json`, 'utf8'),
  [TARGET_LOCALE]: readFileSync(`${I18N_DIR}/locales/${TARGET_LOCALE}.json`, 'utf8'),
};
const catalogs = {
  [SOURCE_LOCALE]: JSON.parse(rawCatalogs[SOURCE_LOCALE]),
  [TARGET_LOCALE]: JSON.parse(rawCatalogs[TARGET_LOCALE]),
};

// Key declarations may be split across module-scoped `*keys.constants.ts` files
// (e.g. practice-keys.constants.ts) so the aggregate catalog stays within its
// size budget; every such file counts as a source of declared keys.
const constantsSource = readdirSync(I18N_DIR)
  .filter((file) => file.endsWith('keys.constants.ts') && !file.endsWith('.test.ts'))
  .map((file) => readFileSync(`${I18N_DIR}/${file}`, 'utf8'))
  .join('\n');

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/u;
const PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/gu;
const QUOTED_LITERAL = /'([^']+)'/gu;
const KEY_SEGMENT = /^[a-zA-Z0-9]+$/u;
const KEY_LINE = /^"([^"]+)"\s*:/u;

const problems = [];

/** Categories CLDR actually defines for a language, straight from ICU. */
function categoriesFor(locale) {
  return [...new Intl.PluralRules(locale).resolvedOptions().pluralCategories].sort();
}

/**
 * Raw duplicate-key scan. `JSON.parse` keeps the last of two identical keys and
 * drops the first silently, so a copy-paste mistake becomes invisible: the
 * translator sees their string in the file and the app renders the other one.
 */
function reportDuplicateKeys(locale) {
  const path = [];
  const scopes = [new Set()];
  for (const line of rawCatalogs[locale].split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('}')) {
      path.pop();
      scopes.pop();
      continue;
    }
    const match = KEY_LINE.exec(trimmed);
    if (match === null) {
      continue;
    }
    const scope = scopes.at(-1) ?? new Set();
    if (scope.has(match[1])) {
      problems.push(`${locale}.json declares "${[...path, match[1]].join('.')}" twice`);
    }
    scope.add(match[1]);
    if (trimmed.endsWith('{')) {
      path.push(match[1]);
      scopes.push(new Set());
    }
  }
}

function flattenKeys(tree, prefix = '') {
  const leaves = [];
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (typeof value === 'string') {
      leaves.push([path, value]);
    } else {
      leaves.push(...flattenKeys(value, path));
    }
  }
  return leaves;
}

function placeholdersOf(values) {
  const names = new Set();
  for (const value of values) {
    for (const match of value.matchAll(PLACEHOLDER)) {
      names.add(match[1]);
    }
  }
  return [...names].sort().join(',');
}

/**
 * Group leaves into families: `points.movementDelta_one` and
 * `points.movementDelta_other` are one family whose base key is what
 * `I18N_KEYS` declares and what feature code calls with a `count`.
 */
function buildFamilies(catalog, locale) {
  const families = new Map();
  for (const [key, value] of flattenKeys(catalog)) {
    const suffix = PLURAL_SUFFIX.exec(key);
    const base = suffix === null ? key : key.slice(0, -suffix[0].length);
    const family = families.get(base) ?? { categories: new Map(), isPlural: false };
    family.isPlural = family.isPlural || suffix !== null;
    family.categories.set(suffix === null ? null : suffix[1], value);
    families.set(base, family);
    if (value.trim() === '') {
      problems.push(`${locale}.json value for "${key}" is empty`);
    }
  }
  return families;
}

for (const locale of [SOURCE_LOCALE, TARGET_LOCALE]) {
  reportDuplicateKeys(locale);
}

const sourceFamilies = buildFamilies(catalogs[SOURCE_LOCALE], SOURCE_LOCALE);
const targetFamilies = buildFamilies(catalogs[TARGET_LOCALE], TARGET_LOCALE);

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

function checkPluralCategories(base, family, locale) {
  const required = categoriesFor(locale);
  const present = [...family.categories.keys()].sort();
  if (present.join(',') !== required.join(',')) {
    problems.push(
      `${locale}.json plural family "${base}" has [${present.join(',')}] but ${locale} needs [${required.join(',')}]`,
    );
  }
}

function checkFamily(base, family, target) {
  if (!declaredKeys.has(base)) {
    problems.push(`I18N_KEYS does not declare catalog key "${base}"`);
  }
  if (family.isPlural !== target.isPlural) {
    problems.push(`"${base}" is plural in one language and singular in the other`);
    return;
  }
  if (family.isPlural) {
    checkPluralCategories(base, family, SOURCE_LOCALE);
    checkPluralCategories(base, target, TARGET_LOCALE);
  }
  const sourcePlaceholders = placeholdersOf(family.categories.values());
  const targetPlaceholders = placeholdersOf(target.categories.values());
  if (sourcePlaceholders !== targetPlaceholders) {
    problems.push(
      `"${base}" placeholders differ: ${SOURCE_LOCALE}=[${sourcePlaceholders}] ${TARGET_LOCALE}=[${targetPlaceholders}]`,
    );
  }
}

for (const [base, family] of sourceFamilies) {
  const target = targetFamilies.get(base);
  if (target === undefined) {
    problems.push(`${TARGET_LOCALE}.json is missing "${base}"`);
    continue;
  }
  checkFamily(base, family, target);
}

for (const base of targetFamilies.keys()) {
  if (!sourceFamilies.has(base)) {
    problems.push(`${SOURCE_LOCALE}.json is missing "${base}"`);
  }
}

for (const key of declaredKeys) {
  if (!sourceFamilies.has(key)) {
    problems.push(`${SOURCE_LOCALE}.json is missing declared key "${key}"`);
  }
}

if (problems.length > 0) {
  console.error(`Locale parity gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}

const pluralFamilies = [...sourceFamilies.values()].filter((family) => family.isPlural).length;
console.log(
  `Locale parity gate passed: ${String(sourceFamilies.size)} key families in ` +
    `${SOURCE_LOCALE}/${TARGET_LOCALE} (${String(pluralFamilies)} pluralized) ` +
    'with matching I18N_KEYS and placeholders.',
);
