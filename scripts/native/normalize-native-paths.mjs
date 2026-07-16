/**
 * Post-sync normalization for generated native project files.
 *
 * Capacitor's CLI writes local package paths using the HOST path separator, so
 * a `cap sync` run on Windows emits Swift like:
 *
 *   .package(name: "CapacitorApp", path: "..\..\..\node_modules\@capacitor\app")
 *
 * Backslashes are not path separators on macOS, and `\a`, `\n`, `\.` are string
 * escapes in Swift — so that committed file is broken for every consumer, and
 * it makes the sync-drift gate fail forever on POSIX CI. Rewriting the paths to
 * POSIX form makes the generated tree identical on every host, which is exactly
 * what the drift gate needs in order to mean anything.
 *
 * A no-op when sync ran on macOS or Linux. Idempotent.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const SPM_MANIFEST = 'ios/App/CapApp-SPM/Package.swift';
// One unambiguous quantifier: two adjacent `[^"]*` around a literal would let
// the engine trade characters between them and backtrack super-linearly
// (regexp/no-super-linear-backtracking). Match the whole quoted argument, then
// decide in JS.
const PATH_ARGUMENT = /path:\s*"([^"]*)"/gu;

function normalizeSwiftPackagePaths(filePath) {
  if (!existsSync(filePath)) {
    return false;
  }
  const original = readFileSync(filePath, 'utf8');
  const normalized = original.replaceAll(PATH_ARGUMENT, (match, rawPath) => {
    return rawPath.includes('\\') ? `path: "${rawPath.replaceAll('\\', '/')}"` : match;
  });
  if (normalized === original) {
    return false;
  }
  writeFileSync(filePath, normalized);
  return true;
}

const changed = normalizeSwiftPackagePaths(SPM_MANIFEST);
console.log(
  changed
    ? `Normalized Windows path separators in ${SPM_MANIFEST}.`
    : 'Native paths already POSIX; nothing to normalize.',
);
process.exit(0);
