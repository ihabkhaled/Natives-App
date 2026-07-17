/**
 * Per-file coverage gate. Parses coverage/coverage-final.json (istanbul
 * format emitted by @vitest/coverage-v8) and fails with an explicit list
 * of every production file below its threshold. Run `npm run test:coverage`
 * first.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import { isPureFile, thresholdFor } from './coverage-policy.mjs';

const coveragePath = resolve('coverage', 'coverage-final.json');

let raw;
try {
  raw = readFileSync(coveragePath, 'utf8');
} catch {
  console.error(`Missing ${coveragePath}. Run "npm run test:coverage" first.`);
  process.exit(1);
}

const coverage = JSON.parse(raw);

function pct(covered, total) {
  return total === 0 ? 100 : (covered / total) * 100;
}

function summarize(fileCoverage) {
  const statements = Object.values(fileCoverage.s);
  const functions = Object.values(fileCoverage.f);
  const branchHits = Object.values(fileCoverage.b).flat();
  const lineTotals = statements;
  return {
    statements: pct(statements.filter((count) => count > 0).length, statements.length),
    functions: pct(functions.filter((count) => count > 0).length, functions.length),
    branches: pct(branchHits.filter((count) => count > 0).length, branchHits.length),
    lines: pct(lineTotals.filter((count) => count > 0).length, lineTotals.length),
  };
}

const failures = [];
let checkedFiles = 0;

for (const [absolutePath, fileCoverage] of Object.entries(coverage)) {
  const relativePath = absolutePath.replaceAll('\\', '/').split('/src/').slice(1).join('src/');
  const srcPath = relativePath === '' ? absolutePath : `src/${relativePath}`;
  checkedFiles += 1;
  const summary = summarize(fileCoverage);
  const threshold = thresholdFor(srcPath);
  const missed = Object.entries(threshold)
    .filter(([metric, minimum]) => summary[metric] < minimum)
    .map(([metric, minimum]) => `${metric} ${summary[metric].toFixed(1)}% < ${String(minimum)}%`);
  if (missed.length > 0) {
    failures.push({ file: srcPath, pure: isPureFile(srcPath), missed });
  }
}

if (checkedFiles === 0) {
  console.error('coverage-final.json contained no files. Did the coverage run include src/**?');
  process.exit(1);
}

if (failures.length > 0) {
  console.error(`Per-file coverage gate FAILED for ${String(failures.length)} file(s):\n`);
  for (const failure of failures.sort((a, b) => a.file.localeCompare(b.file))) {
    const label = failure.pure ? ' [pure: 100% required]' : '';
    console.error(`  ${failure.file}${label}`);
    for (const miss of failure.missed) {
      console.error(`    - ${miss}`);
    }
  }
  process.exit(1);
}

console.log(`Per-file coverage gate passed for ${String(checkedFiles)} files.`);
