import { existsSync, readFileSync, readdirSync } from 'node:fs';

import { listCanonicalMarkdown } from './inventory.mjs';

const CRITICAL_KEYWORDS = [
  'auth',
  'token',
  'login',
  'password',
  'secret',
  'permission',
  'deep link',
  'deep-link',
  'secure',
  'migration',
];
const STANDARD_KEYWORDS = ['api', 'http', 'native', 'plugin', 'storage', 'route', 'dependency'];

function tokenize(text) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/gu, ' ')
        .split(/[\s-]+/u)
        .filter((token) => token.length > 2),
    ),
  ];
}

function scoreDocument(file, content, tokens) {
  const haystack = `${file.toLowerCase()} ${content.slice(0, 4000).toLowerCase()}`;
  let score = 0;
  for (const token of tokens) {
    if (file.toLowerCase().includes(token)) {
      score += 5;
    }
    if (haystack.includes(token)) {
      score += 1;
    }
  }
  return score;
}

function riskLaneFor(task) {
  const lower = task.toLowerCase();
  if (CRITICAL_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return 'critical';
  }
  if (STANDARD_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return 'standard';
  }
  return 'routine';
}

const LANE_GATES = {
  routine: ['npm run lint', 'npm run typecheck', 'npm run test:unit'],
  standard: [
    'npm run lint',
    'npm run typecheck',
    'npm run test:coverage && npm run test:coverage:per-file',
    'npm run quality:architecture && npm run quality:package-ownership',
    'npm run build',
  ],
  critical: [
    'npm run lint',
    'npm run typecheck',
    'npm run test:coverage && npm run test:coverage:per-file',
    'npm run test:integration && npm run test:contract',
    'npm run quality:architecture && npm run quality:package-ownership',
    'npm run security:audit && npm run security:secrets',
    'npm run test:e2e',
  ],
};

export function resolveContext({ task, files = [], symbols = [] }) {
  const tokens = [
    ...tokenize(task),
    ...files.flatMap((file) => tokenize(file)),
    ...symbols.flatMap((symbol) => tokenize(symbol)),
  ];
  const scored = listCanonicalMarkdown()
    .map((file) => ({
      file,
      score: scoreDocument(file, readFileSync(file, 'utf8'), tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file));

  const rules = scored.filter((entry) => entry.file.startsWith('rules/')).slice(0, 5);
  const skills = scored.filter((entry) => entry.file.startsWith('skills/')).slice(0, 1);
  const adrs = scored.filter((entry) => entry.file.startsWith('architecture/adrs/')).slice(0, 3);
  const contextDocs = scored.filter((entry) => entry.file.startsWith('context/')).slice(0, 3);
  const pitfalls = scored.filter((entry) => entry.file.startsWith('memory/')).slice(0, 2);

  const modules = existsSync('src/modules') ? readdirSync('src/modules') : [];
  const owningModules = modules.filter(
    (name) => tokens.includes(name) || files.some((file) => file.includes(`modules/${name}/`)),
  );
  const lane = riskLaneFor(task);

  return {
    task,
    lane,
    owningModules,
    rules,
    skills,
    adrs,
    contextDocs,
    pitfalls,
    gates: LANE_GATES[lane],
  };
}

export function renderContext(resolution) {
  const section = (title, entries) =>
    entries.length === 0
      ? `## ${title}\n\n- (none matched)\n`
      : `## ${title}\n\n${entries.map((entry) => `- ${entry.file}`).join('\n')}\n`;
  return [
    `# Context for: ${resolution.task}`,
    '',
    `Risk lane: **${resolution.lane}**`,
    '',
    `Owning modules: ${resolution.owningModules.length > 0 ? resolution.owningModules.join(', ') : '(resolve from files)'}`,
    '',
    section('Rules', resolution.rules),
    section('Skill', resolution.skills),
    section('ADRs', resolution.adrs),
    section('Context maps', resolution.contextDocs),
    section('Known pitfalls', resolution.pitfalls),
    '## Required gates',
    '',
    resolution.gates.map((gate) => `- ${gate}`).join('\n'),
    '',
  ].join('\n');
}

export function runBenchmark() {
  const samples = [
    'add a new profile feature module with a list screen',
    'fix token refresh loop in the http client',
    'add a capacitor camera plugin behind an owner package',
    'improve login form validation errors in arabic',
    'raise unit test coverage for the settings store',
    'audit deep link handling for security issues',
  ];
  const rows = [];
  const started = performance.now();
  for (const task of samples) {
    const taskStart = performance.now();
    const resolution = resolveContext({ task });
    rows.push({
      task,
      ms: Math.round((performance.now() - taskStart) * 10) / 10,
      rules: resolution.rules.length,
      skill: resolution.skills.length,
      lane: resolution.lane,
    });
  }
  const totalMs = Math.round(performance.now() - started);
  return { rows, totalMs };
}
