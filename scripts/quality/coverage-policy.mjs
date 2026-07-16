/**
 * Coverage policy shared by vitest.config.ts (documented there) and the
 * per-file checker. Pure-logic globs must stay in sync with the config.
 */
export const PER_FILE_THRESHOLD = { statements: 95, branches: 95, functions: 95, lines: 95 };

export const PURE_FILE_THRESHOLD = { statements: 100, branches: 100, functions: 100, lines: 100 };

export const PURE_FILE_SUFFIXES = [
  '.helper.ts',
  '.utils.ts',
  '.mapper.ts',
  '.schema.ts',
  '.keys.ts',
  '.paths.ts',
  '.selectors.ts',
  '.migrations.ts',
  '.parser.ts',
];

export function isPureFile(filePath) {
  return PURE_FILE_SUFFIXES.some((suffix) => filePath.endsWith(suffix));
}

export function thresholdFor(filePath) {
  return isPureFile(filePath) ? PURE_FILE_THRESHOLD : PER_FILE_THRESHOLD;
}
