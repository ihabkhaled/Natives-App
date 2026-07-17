import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Recursively list files under a directory (posix-style relative paths). */
export function walkFiles(rootDir, { extensions = null } = {}) {
  const results = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      const fullPath = join(current, entry);
      if (statSync(fullPath).isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (extensions === null || extensions.some((ext) => entry.endsWith(ext))) {
        results.push(fullPath.replaceAll('\\', '/'));
      }
    }
  }
  return results.sort();
}
