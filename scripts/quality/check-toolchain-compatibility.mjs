/**
 * Dual-compiler retirement watcher (ADR-0011). Fails loudly the moment the
 * TypeScript ESLint parser officially supports the primary TypeScript major:
 * at that point the compatibility compiler must be removed.
 */
import { readFileSync } from 'node:fs';
import process from 'node:process';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const primaryAlias = packageJson.devDependencies?.typescript7 ?? '';
const primaryMajor = Number(/npm:typescript@(\d+)/u.exec(primaryAlias)?.[1] ?? 'NaN');

const parserPackage = JSON.parse(
  readFileSync('node_modules/typescript-eslint/package.json', 'utf8'),
);
const peerRange = parserPackage.peerDependencies?.typescript ?? '';
const upperBound = /<\s*(\d+)/u.exec(peerRange);
const supportsPrimary = upperBound === null ? true : Number(upperBound[1]) > primaryMajor;

if (Number.isNaN(primaryMajor)) {
  console.log('No typescript7 compatibility alias found; single-compiler setup.');
  process.exit(0);
}

if (supportsPrimary) {
  console.error(
    `typescript-eslint now declares TypeScript peer range "${peerRange}", which covers ` +
      `the primary compiler (v${String(primaryMajor)}). Remove the dual-compiler arrangement: ` +
      'drop the "typescript" 5.x devDependency, point "typescript" at v7, delete the ' +
      '"typescript7" alias, and update ADR-0011 + docs/dependencies/typescript-compatibility.md.',
  );
  process.exit(1);
}

console.log(
  `Dual compiler still required: typescript-eslint peer range "${peerRange}" excludes v${String(primaryMajor)}.`,
);
