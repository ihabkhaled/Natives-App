import { readFileSync } from 'node:fs';

const IMPORT_PATTERN = /^\s*(?:import|export)\s[^;]*?from\s+['"]([^'"]+)['"]/gmu;
const DYNAMIC_IMPORT_PATTERN = /import\(\s*['"]([^'"]+)['"]\s*\)/gu;

/** Extract every static and dynamic import source from a file. */
export function importSourcesOf(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const sources = [];
  for (const match of content.matchAll(IMPORT_PATTERN)) {
    sources.push(match[1]);
  }
  for (const match of content.matchAll(DYNAMIC_IMPORT_PATTERN)) {
    sources.push(match[1]);
  }
  return sources;
}

export function vendorPackageName(source) {
  if (source.startsWith('.') || source.startsWith('@/')) {
    return null;
  }
  const segments = source.split('/');
  return source.startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0];
}
