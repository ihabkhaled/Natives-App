/**
 * Structural architecture gate (complements the ESLint plugin):
 * - canonical top-level layers exist
 * - every module exposes index.ts and README.md
 * - every package owner exposes index.ts
 * - one-way layer direction holds for every import (regex scan)
 * - no cross-module deep imports
 */
import { existsSync, readdirSync } from 'node:fs';
import process from 'node:process';

import { walkFiles } from '../quality/file-walk.mjs';
import { importSourcesOf } from './import-scan.mjs';

const ALLOWED_TARGETS = {
  app: ['app', 'modules', 'platform', 'shared', 'packages', 'tests'],
  modules: ['modules', 'platform', 'shared', 'packages'],
  platform: ['platform', 'shared', 'packages'],
  shared: ['shared', 'packages'],
  packages: ['packages'],
  tests: ['app', 'modules', 'platform', 'shared', 'packages', 'tests'],
};

const problems = [];

for (const layer of ['src/app', 'src/modules', 'src/packages', 'src/platform', 'src/shared']) {
  if (!existsSync(layer)) {
    problems.push(`missing canonical layer directory: ${layer}`);
  }
}

for (const moduleName of readdirSync('src/modules')) {
  if (!existsSync(`src/modules/${moduleName}/index.ts`)) {
    problems.push(`module "${moduleName}" is missing its public index.ts`);
  }
  if (!existsSync(`src/modules/${moduleName}/README.md`)) {
    problems.push(`module "${moduleName}" is missing its README.md`);
  }
}

for (const packageName of readdirSync('src/packages')) {
  if (!existsSync(`src/packages/${packageName}/index.ts`)) {
    problems.push(`package owner "${packageName}" is missing its public index.ts`);
  }
}

function layerOf(srcPath) {
  const segments = srcPath.split('/');
  return segments[1] ?? 'unknown';
}

function moduleOf(srcPath) {
  const segments = srcPath.split('/');
  return segments[1] === 'modules' ? (segments[2] ?? null) : null;
}

function resolveInternal(file, source) {
  if (source.startsWith('@/')) {
    return `src/${source.slice(2)}`;
  }
  if (!source.startsWith('.')) {
    return null;
  }
  const baseSegments = file.split('/').slice(0, -1);
  for (const segment of source.split('/')) {
    if (segment === '.' || segment === '') {
      continue;
    }
    if (segment === '..') {
      baseSegments.pop();
    } else {
      baseSegments.push(segment);
    }
  }
  return baseSegments.join('/');
}

const sourceFiles = walkFiles('src', { extensions: ['.ts', '.tsx'] }).filter(
  (file) => !file.includes('.test.'),
);
for (const file of sourceFiles) {
  const fromLayer = layerOf(file);
  const allowed = ALLOWED_TARGETS[fromLayer];
  for (const source of importSourcesOf(file)) {
    const target = resolveInternal(file, source);
    if (target === null || !target.startsWith('src/')) {
      continue;
    }
    const targetLayer = layerOf(target);
    if (allowed !== undefined && !allowed.includes(targetLayer)) {
      problems.push(`${file}: layer "${fromLayer}" must not import "${targetLayer}" (${source})`);
    }
    const fromModule = moduleOf(file);
    const targetModule = moduleOf(target);
    if (
      targetModule !== null &&
      targetModule !== fromModule &&
      target !== `src/modules/${targetModule}` &&
      target !== `src/modules/${targetModule}/index`
    ) {
      problems.push(`${file}: deep import into module "${targetModule}" (${source})`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Architecture gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log(`Architecture gate passed: ${String(sourceFiles.length)} files scanned.`);
