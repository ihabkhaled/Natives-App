import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

import { walkFiles } from '../../quality/file-walk.mjs';

export const CANONICAL_ROOTS = [
  'rules',
  'skills',
  'agents',
  'context',
  'memory',
  'architecture/adrs',
  'docs',
];

export const GOVERNANCE_VERSION = 1;

/** Deterministic inventory of canonical knowledge files with content hashes. */
export function buildInventory() {
  const files = {};
  for (const root of CANONICAL_ROOTS) {
    if (!existsSync(root)) {
      continue;
    }
    for (const file of walkFiles(root, { extensions: ['.md', '.json'] })) {
      const content = readFileSync(file);
      files[file] = createHash('sha256').update(content).digest('hex').slice(0, 16);
    }
  }
  return files;
}

export function readMarkdown(path) {
  return readFileSync(path, 'utf8');
}

export function listCanonicalMarkdown() {
  return CANONICAL_ROOTS.filter((root) => existsSync(root)).flatMap((root) =>
    walkFiles(root, { extensions: ['.md'] }),
  );
}
