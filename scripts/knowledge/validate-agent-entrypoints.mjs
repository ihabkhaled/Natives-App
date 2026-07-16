/**
 * Agent entrypoint gate: every model-specific entry file exists, carries
 * the same Governance-Version marker, and points at AGENTS.md.
 */
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const ENTRYPOINTS = [
  'CLAUDE.md',
  'CODEX.md',
  'GEMINI.md',
  'KIMI.md',
  'QWEN.md',
  'GLM.md',
  'DEEPSEEK.md',
  'cursor.md',
  '.github/copilot-instructions.md',
];

const MARKERLESS_ENTRYPOINTS = ['.cursorrules', '.windsurfrules'];

const problems = [];

if (!existsSync('AGENTS.md')) {
  problems.push('AGENTS.md (universal entrypoint) is missing');
}

const agentsContent = existsSync('AGENTS.md') ? readFileSync('AGENTS.md', 'utf8') : '';
const versionMatch = /Governance-Version:\s*(\d+)/u.exec(agentsContent);
if (versionMatch === null) {
  problems.push('AGENTS.md is missing the Governance-Version marker');
}
const governanceVersion = versionMatch?.[1] ?? null;

for (const entrypoint of ENTRYPOINTS) {
  if (!existsSync(entrypoint)) {
    problems.push(`missing entrypoint: ${entrypoint}`);
    continue;
  }
  const content = readFileSync(entrypoint, 'utf8');
  if (!content.includes('AGENTS.md')) {
    problems.push(`${entrypoint} does not point to AGENTS.md`);
  }
  const entryVersion = /Governance-Version:\s*(\d+)/u.exec(content)?.[1] ?? null;
  if (governanceVersion !== null && entryVersion !== governanceVersion) {
    problems.push(
      `${entrypoint} Governance-Version (${entryVersion ?? 'none'}) != AGENTS.md (${governanceVersion})`,
    );
  }
}

for (const entrypoint of MARKERLESS_ENTRYPOINTS) {
  if (!existsSync(entrypoint)) {
    problems.push(`missing entrypoint: ${entrypoint}`);
    continue;
  }
  if (!readFileSync(entrypoint, 'utf8').includes('AGENTS.md')) {
    problems.push(`${entrypoint} does not point to AGENTS.md`);
  }
}

if (!existsSync('.cursor/rules/00-core.mdc')) {
  problems.push('missing .cursor/rules/00-core.mdc');
}

if (problems.length > 0) {
  console.error(`Agent entrypoint gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log('Agent entrypoint gate passed.');
