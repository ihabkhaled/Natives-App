import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_VISIBILITIES,
  STANDINGS_LIMITS,
  type AchievementCategory,
  type AchievementImportOutcome,
  type AchievementVisibility,
} from '../constants/standings.constants';
import type { AchievementImportReport, AchievementImportRow } from '../types/achievements.types';
import type { ImportWizardView } from '../types/achievements-view.types';

/** Why a pasted CSV cannot be parsed into import rows. */
export type ImportParseIssue = 'empty' | 'tooManyRows' | 'badRow' | null;

export interface ImportParseResult {
  readonly rows: readonly AchievementImportRow[];
  readonly issue: ImportParseIssue;
  readonly badLine: number;
}

function isCategory(value: string): value is AchievementCategory {
  return (ACHIEVEMENT_CATEGORIES as readonly string[]).includes(value);
}

function isVisibility(value: string): value is AchievementVisibility {
  return (ACHIEVEMENT_VISIBILITIES as readonly string[]).includes(value);
}

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/u;

/** The optional visibility cell as a value, or `'bad'` when it is unrecognized. */
function parseVisibility(cell: string): AchievementVisibility | null | 'bad' {
  if (cell === '') {
    return null;
  }
  return isVisibility(cell) ? cell : 'bad';
}

function isValidLine(
  reference: string,
  title: string,
  category: string,
  achievedOn: string,
): boolean {
  return (
    reference.length >= 2 &&
    title.length >= 2 &&
    isCategory(category) &&
    DATE_SHAPE.test(achievedOn)
  );
}

function parseLine(line: string): AchievementImportRow | null {
  const cells = [...line.split(',').map((cell) => cell.trim()), '', '', '', '', '', ''];
  const [reference, category, title, achievedOn, description, visibility] = cells as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const visibilityValue = parseVisibility(visibility);
  if (!isValidLine(reference, title, category, achievedOn) || visibilityValue === 'bad') {
    return null;
  }
  return {
    reference,
    category: category as AchievementCategory,
    title,
    achievedOn,
    description: description === '' ? null : description,
    visibility: visibilityValue,
  };
}

/**
 * Parse pasted CSV (`reference,category,title,achievedOn[,description[,visibility]]`)
 * into validated rows before any network call. Every row is checked client-side
 * against the same closed vocabularies the backend enforces; the first bad line
 * is reported by number so the fix is a glance, not a hunt.
 */
export function parseImportCsv(text: string): ImportParseResult {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  if (lines.length === 0) {
    return { rows: [], issue: 'empty', badLine: 0 };
  }
  if (lines.length > STANDINGS_LIMITS.importMaxRows) {
    return { rows: [], issue: 'tooManyRows', badLine: 0 };
  }
  const rows: AchievementImportRow[] = [];
  for (const [index, line] of lines.entries()) {
    const row = parseLine(line);
    if (row === null) {
      return { rows: [], issue: 'badRow', badLine: index + 1 };
    }
    rows.push(row);
  }
  return { rows, issue: null, badLine: 0 };
}

/** The chip tone of one import outcome. */
export function importOutcomeTone(outcome: AchievementImportOutcome): string {
  if (outcome === 'imported') {
    return 'success';
  }
  return outcome === 'skipped_duplicate' ? 'medium' : 'danger';
}

const OUTCOME_LABEL_KEYS: Readonly<Record<AchievementImportOutcome, string>> = {
  imported: I18N_KEYS.standings.importOutcomeImported,
  skipped_duplicate: I18N_KEYS.standings.importOutcomeSkipped,
  rejected_invalid: I18N_KEYS.standings.importOutcomeRejected,
};

type Translate = (key: string, params?: TranslateParams) => string;

/** The 3-step wizard state + callbacks its view binds. */
export interface ImportWizardDeps {
  readonly report: AchievementImportReport | null;
  readonly csvText: string;
  readonly parseError: string | null;
  readonly parsedRowCount: number;
  readonly isOffline: boolean;
  readonly isRunning: boolean;
  readonly onInputChange: (value: string) => void;
  readonly onParse: () => void;
  readonly onCommit: () => void;
  readonly onBack: () => void;
}

function buildOutcomeRows(t: Translate, report: AchievementImportReport | null) {
  if (report === null) {
    return [];
  }
  return report.rows.map((row) => ({
    key: row.reference,
    reference: row.reference,
    outcome: { label: t(OUTCOME_LABEL_KEYS[row.outcome]), tone: importOutcomeTone(row.outcome) },
  }));
}

function buildTotals(t: Translate, report: AchievementImportReport | null): string | null {
  if (report === null) {
    return null;
  }
  return t(I18N_KEYS.standings.importTotals, {
    received: String(report.received),
    imported: String(report.imported),
    skipped: String(report.skippedDuplicate),
    rejected: String(report.rejectedInvalid),
  });
}

type ImportStep = 'input' | 'preview' | 'done';

function resolveImportStep(report: AchievementImportReport | null): ImportStep {
  if (report === null) {
    return 'input';
  }
  return report.dryRun ? 'preview' : 'done';
}

/** The step-dependent labels and enablement of the wizard actions. */
function buildImportActions(t: Translate, step: ImportStep, deps: ImportWizardDeps) {
  const busy = deps.isOffline || deps.isRunning;
  return {
    canParse: deps.csvText.trim() !== '' && !busy,
    commitLabel:
      step === 'done' ? t(I18N_KEYS.standings.importDone) : t(I18N_KEYS.standings.importCommit),
    canCommit: step === 'preview' && deps.parsedRowCount > 0 && !busy,
  };
}

/** The full wizard view for the current step. */
export function buildImportWizardView(t: Translate, deps: ImportWizardDeps): ImportWizardView {
  const { report } = deps;
  const step = resolveImportStep(report);
  return {
    heading: t(I18N_KEYS.standings.importHeading),
    intro: t(I18N_KEYS.standings.importIntro),
    step,
    inputLabel: t(I18N_KEYS.standings.importInputLabel),
    inputHint: t(I18N_KEYS.standings.importInputHint),
    inputValue: deps.csvText,
    onInputChange: deps.onInputChange,
    parseError: deps.parseError,
    parseLabel: t(I18N_KEYS.standings.importDryRun),
    onParse: deps.onParse,
    previewHeading: report === null ? null : t(I18N_KEYS.standings.importDryRunHeading),
    outcomeRows: buildOutcomeRows(t, report),
    totals: buildTotals(t, report),
    ...buildImportActions(t, step, deps),
    isRunning: deps.isRunning,
    onCommit: deps.onCommit,
    backLabel: t(I18N_KEYS.standings.importBack),
    onBack: deps.onBack,
  };
}
