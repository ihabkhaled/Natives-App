import { readFileSync } from 'node:fs';

import { listCanonicalMarkdown } from './inventory.mjs';

const LIST_PREFIX = /^[\s\d.*-]+/u;
const NON_ALPHANUMERIC = /[^a-z0-9\s]/gu;
const WHITESPACE_RUN = /\s+/gu;
const MIN_PREDICATE_LENGTH = 10;
const MAX_PREDICATE_LENGTH = 80;

function normalizeStatement(line) {
  return line
    .toLowerCase()
    .replace(LIST_PREFIX, '')
    .replace(NON_ALPHANUMERIC, '')
    .replace(WHITESPACE_RUN, ' ')
    .trim();
}

/** Extract the predicate after a leading MUST/ALWAYS MUST or NEVER, or null. */
function predicateAfter(normalized, keyword) {
  const withoutAlways =
    keyword === 'must' && normalized.startsWith('always ')
      ? normalized.slice('always '.length)
      : normalized;
  const prefix = `${keyword} `;
  if (!withoutAlways.startsWith(prefix)) {
    return null;
  }
  const predicate = withoutAlways.slice(prefix.length);
  return predicate.length >= MIN_PREDICATE_LENGTH && predicate.length <= MAX_PREDICATE_LENGTH
    ? predicate
    : null;
}

/** MUST vs NEVER over the same normalized predicate across the rules corpus. */
export function findContradictions() {
  const musts = new Map();
  const nevers = new Map();
  for (const file of listCanonicalMarkdown()) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const normalized = normalizeStatement(line);
      const must = predicateAfter(normalized, 'must');
      const never = predicateAfter(normalized, 'never');
      if (must !== null) {
        musts.set(must, file);
      }
      if (never !== null) {
        nevers.set(never, file);
      }
    }
  }
  const problems = [];
  for (const [predicate, file] of musts) {
    if (nevers.has(predicate)) {
      problems.push(
        `contradiction: "${predicate}" is MUST in ${file} and NEVER in ${nevers.get(predicate)}`,
      );
    }
  }
  return problems;
}

/** Identical blocks of 5+ consecutive normalized lines across different files. */
export function findDuplicates() {
  const WINDOW = 5;
  const seen = new Map();
  const problems = new Set();
  for (const file of listCanonicalMarkdown()) {
    const lines = readFileSync(file, 'utf8')
      .split('\n')
      .map((line) => normalizeStatement(line))
      .filter((line) => line.length > 12);
    for (let index = 0; index + WINDOW <= lines.length; index += 1) {
      const block = lines.slice(index, index + WINDOW).join('|');
      const previous = seen.get(block);
      if (previous !== undefined && previous !== file) {
        problems.add(`duplicate block shared by ${previous} and ${file}`);
      } else {
        seen.set(block, file);
      }
    }
  }
  return [...problems];
}

/** Canonical markdown files no other canonical document links to. */
export function findOrphans() {
  const files = listCanonicalMarkdown();
  const referenced = new Set();
  const allContent = files.map((file) => ({ file, content: readFileSync(file, 'utf8') }));
  for (const { content } of allContent) {
    for (const match of content.matchAll(/\(([^)\s]+\.md)\)/gu)) {
      referenced.add(match[1].split('/').pop());
    }
    for (const match of content.matchAll(/`([\w./-]+\.md)`/gu)) {
      referenced.add(match[1].split('/').pop());
    }
  }
  return files
    .filter((file) => {
      const base = file.split('/').pop() ?? '';
      if (base === 'README.md' || file.startsWith('docs/')) {
        return false;
      }
      return !referenced.has(base);
    })
    .map((file) => `orphaned document (nothing links to it): ${file}`);
}
