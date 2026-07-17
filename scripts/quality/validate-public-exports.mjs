/**
 * Public-surface gate: module and package index.ts files are re-export
 * surfaces only (export statements, comments, side-effect css imports),
 * and every declared surface exists.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import process from 'node:process';

const problems = [];

/**
 * Strip comments, then split into statements. Multi-line named exports
 * (`export {\n  a,\n  b,\n} from '...'`) must be treated as one statement.
 */
function statementsOf(source) {
  const withoutBlockComments = source.replaceAll(/\/\*[\s\S]*?\*\//gu, '');
  const withoutLineComments = withoutBlockComments
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
  return withoutLineComments
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement !== '');
}

function checkSurface(indexPath, { allowSideEffectImports = false } = {}) {
  if (!existsSync(indexPath)) {
    problems.push(`missing public surface: ${indexPath}`);
    return;
  }
  for (const statement of statementsOf(readFileSync(indexPath, 'utf8'))) {
    if (statement.startsWith('export ')) {
      continue;
    }
    if (allowSideEffectImports && /^import\s+['"][^'"]+['"]$/u.test(statement)) {
      continue;
    }
    const preview = statement.split('\n')[0].slice(0, 60);
    problems.push(`${indexPath}: non-export statement in public surface ("${preview}")`);
  }
}

for (const moduleName of readdirSync('src/modules')) {
  checkSurface(`src/modules/${moduleName}/index.ts`);
}
for (const packageName of readdirSync('src/packages')) {
  checkSurface(`src/packages/${packageName}/index.ts`, { allowSideEffectImports: true });
}
checkSurface('src/platform/index.ts');
checkSurface('src/shared/index.ts');

if (problems.length > 0) {
  console.error(`Public-export gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log('Public-export gate passed.');
