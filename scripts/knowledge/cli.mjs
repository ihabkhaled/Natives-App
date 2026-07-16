/**
 * Knowledge system CLI. Commands:
 *   build [--incremental|--graphs-only|--packs-only]
 *   validate [--links-only] | stale | contradictions | duplicates | orphans
 *   context --task="..." [--files="a,b"] [--symbols="x,y"]
 *   benchmark | report
 */
import process from 'node:process';

import { findContradictions, findDuplicates, findOrphans } from './lib/analyze.mjs';
import { buildKnowledge } from './lib/generate.mjs';
import { buildInventory, GOVERNANCE_VERSION } from './lib/inventory.mjs';
import { renderContext, resolveContext, runBenchmark } from './lib/resolve.mjs';
import { findStaleness, validateKnowledge } from './lib/validate.mjs';

const [command, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((arg) => arg.startsWith('--') && !arg.includes('=')));

function option(name) {
  const raw = rest.find((arg) => arg.startsWith(`--${name}=`));
  return raw === undefined ? null : raw.slice(name.length + 3);
}

function reportProblems(label, problems) {
  if (problems.length === 0) {
    console.log(`${label}: OK`);
    return;
  }
  console.error(`${label}: ${String(problems.length)} problem(s)`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}

switch (command) {
  case 'build': {
    buildKnowledge({
      incremental: flags.has('--incremental'),
      graphsOnly: flags.has('--graphs-only'),
      packsOnly: flags.has('--packs-only'),
    });
    break;
  }
  case 'validate': {
    reportProblems(
      'knowledge:validate',
      validateKnowledge({ linksOnly: flags.has('--links-only') }),
    );
    break;
  }
  case 'stale': {
    reportProblems('knowledge:stale', findStaleness());
    break;
  }
  case 'contradictions': {
    reportProblems('knowledge:contradictions', findContradictions());
    break;
  }
  case 'duplicates': {
    reportProblems('knowledge:duplicates', findDuplicates());
    break;
  }
  case 'orphans': {
    reportProblems('knowledge:orphans', findOrphans());
    break;
  }
  case 'context': {
    const task = option('task');
    if (task === null || task.trim() === '') {
      console.error('Usage: npm run knowledge:context -- --task="<exact task>"');
      process.exit(1);
    }
    const files = (option('files') ?? '').split(',').filter((entry) => entry !== '');
    const symbols = (option('symbols') ?? '').split(',').filter((entry) => entry !== '');
    console.log(renderContext(resolveContext({ task, files, symbols })));
    break;
  }
  case 'benchmark': {
    const { rows, totalMs } = runBenchmark();
    for (const row of rows) {
      console.log(
        `${row.ms}ms lane=${row.lane} rules=${String(row.rules)} skill=${String(row.skill)} :: ${row.task}`,
      );
    }
    console.log(`total ${String(totalMs)}ms for ${String(rows.length)} resolutions`);
    const unresolved = rows.filter((row) => row.rules === 0);
    if (totalMs > 5000 || unresolved.length > 0) {
      console.error('benchmark FAILED: resolver too slow or returned no rules for a sample task');
      process.exit(1);
    }
    break;
  }
  case 'report': {
    const inventory = buildInventory();
    const byRoot = {};
    for (const file of Object.keys(inventory)) {
      const root = file.split('/')[0];
      byRoot[root] = (byRoot[root] ?? 0) + 1;
    }
    console.log(JSON.stringify({ governanceVersion: GOVERNANCE_VERSION, files: byRoot }, null, 2));
    break;
  }
  default: {
    console.error(`Unknown knowledge command: ${command ?? '(none)'}`);
    process.exit(1);
  }
}
