import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

import { walkFiles } from '../../quality/file-walk.mjs';
import { GENERATED_HEADER } from './generate.mjs';
import { buildInventory, GOVERNANCE_VERSION, listCanonicalMarkdown } from './inventory.mjs';

const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)\)/gu;

export function findBrokenLinks() {
  const problems = [];
  for (const file of listCanonicalMarkdown()) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(LINK_PATTERN)) {
      const target = match[1];
      if (/^(?:https?:|mailto:|#)/u.test(target)) {
        continue;
      }
      const withoutAnchor = target.split('#')[0];
      if (withoutAnchor === '') {
        continue;
      }
      const resolved = normalize(join(dirname(file), withoutAnchor)).replaceAll('\\', '/');
      if (!existsSync(resolved)) {
        problems.push(`${file}: broken link "${target}"`);
      }
    }
  }
  return problems;
}

export function findStaleness() {
  const problems = [];
  if (!existsSync('.ai/manifest.json')) {
    return ['.ai/manifest.json missing — run npm run knowledge:build'];
  }
  const manifest = JSON.parse(readFileSync('.ai/manifest.json', 'utf8'));
  const current = buildInventory();
  for (const [file, hash] of Object.entries(current)) {
    if (manifest.files[file] === undefined) {
      problems.push(`canonical file not in manifest (stale .ai): ${file}`);
    } else if (manifest.files[file] !== hash) {
      problems.push(`canonical file changed since last build: ${file}`);
    }
  }
  for (const file of Object.keys(manifest.files)) {
    if (current[file] === undefined) {
      problems.push(`manifest references deleted canonical file: ${file}`);
    }
  }
  return problems;
}

export function validateKnowledge({ linksOnly = false } = {}) {
  const problems = [];
  if (!linksOnly) {
    if (!existsSync('.ai/BOOTSTRAP.md')) {
      problems.push('.ai/BOOTSTRAP.md missing — run npm run knowledge:build');
    }
    const manifest = existsSync('.ai/manifest.json')
      ? JSON.parse(readFileSync('.ai/manifest.json', 'utf8'))
      : null;
    if (manifest === null) {
      problems.push('.ai/manifest.json missing');
    } else if (manifest.governanceVersion !== GOVERNANCE_VERSION) {
      problems.push(
        `manifest governanceVersion ${String(manifest.governanceVersion)} != ${String(GOVERNANCE_VERSION)}`,
      );
    }
    for (const file of existsSync('.ai') ? walkFiles('.ai', { extensions: ['.md'] }) : []) {
      if (!readFileSync(file, 'utf8').startsWith(GENERATED_HEADER)) {
        problems.push(`${file}: missing generated do-not-edit header`);
      }
    }
    problems.push(...findStaleness());
  }
  problems.push(...findBrokenLinks());
  return problems;
}
