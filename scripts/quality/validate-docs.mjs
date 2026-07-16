/**
 * Documentation gate:
 * 1. Every relative markdown link in canonical docs resolves to a file.
 * 2. Every architecture plugin rule has a doc at docs/eslint/<rule>.md.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import process from 'node:process';

import { ALL_ARCHITECTURE_RULE_NAMES } from '../../eslint/architecture-plugin/index.mjs';
import { walkFiles } from './file-walk.mjs';

const DOC_ROOTS = ['docs', 'rules', 'skills', 'agents', 'context', 'memory', 'architecture'];
const LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)\)/gu;

const problems = [];

for (const ruleName of ALL_ARCHITECTURE_RULE_NAMES) {
  if (!existsSync(`docs/eslint/${ruleName}.md`)) {
    problems.push(`missing rule doc: docs/eslint/${ruleName}.md`);
  }
}

const markdownFiles = DOC_ROOTS.filter((root) => existsSync(root)).flatMap((root) =>
  walkFiles(root, { extensions: ['.md'] }),
);
markdownFiles.push(...['README.md', 'AGENTS.md'].filter((file) => existsSync(file)));

for (const file of markdownFiles) {
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

if (problems.length > 0) {
  console.error(`Documentation gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log(`Documentation gate passed: ${String(markdownFiles.length)} markdown files checked.`);
