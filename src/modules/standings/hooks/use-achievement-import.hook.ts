import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  buildImportWizardView,
  parseImportCsv,
  type ImportParseIssue,
} from '../helpers/import-wizard.helper';
import { resolveStandingsWriteErrorKey } from '../helpers/to-standings-error.helper';
import { useImportAchievementsMutation } from '../mutations/use-import-achievements-mutation.hook';
import type { AchievementImportReport, AchievementImportRow } from '../types/achievements.types';
import type { ImportWizardView } from '../types/achievements-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

interface ImportHookInput {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCommitted: (report: AchievementImportReport) => void;
}

function parseIssueMessage(t: Translate, issue: ImportParseIssue, badLine: number): string | null {
  if (issue === 'tooManyRows') {
    return t(I18N_KEYS.standings.importTooManyRows);
  }
  if (issue === 'badRow') {
    return t(I18N_KEYS.standings.importParseError, { line: String(badLine) });
  }
  return null;
}

/**
 * The 3-step import wizard state machine (parse → dry-run preview → commit),
 * mirroring the backend's dry-run-first contract: rows are validated
 * client-side, previewed via `dryRun: true` (the backend default), and only
 * an explicit confirm sends the real run.
 */
export function useAchievementImport(
  t: Translate,
  input: ImportHookInput,
): ImportWizardView | null {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<readonly AchievementImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [report, setReport] = useState<AchievementImportReport | null>(null);

  const importMutation = useImportAchievementsMutation(input.teamId, {
    onSuccess: (result) => {
      setReport(result);
      if (!result.dryRun) {
        input.onCommitted(result);
      }
    },
    onError: (error) => {
      setParseError(t(resolveStandingsWriteErrorKey(error, I18N_KEYS.standings.importFailed)));
    },
  });

  if (!input.isOpen) {
    return null;
  }

  return buildImportWizardView(t, {
    report,
    csvText,
    parseError,
    parsedRowCount: parsedRows.length,
    isOffline: input.isOffline,
    isRunning: importMutation.isRunning,
    onInputChange: (value) => {
      setCsvText(value);
      setParseError(null);
    },
    onParse: () => {
      const parsed = parseImportCsv(csvText);
      if (parsed.issue !== null) {
        setParseError(parseIssueMessage(t, parsed.issue, parsed.badLine));
        return;
      }
      setParsedRows(parsed.rows);
      importMutation.run({ dryRun: true, rows: parsed.rows });
    },
    onCommit: () => {
      importMutation.run({ dryRun: false, rows: parsedRows });
    },
    onBack: () => {
      const closing = !report?.dryRun;
      setReport(null);
      setParsedRows([]);
      setParseError(null);
      if (closing) {
        setCsvText('');
        input.onClose();
      }
    },
  });
}
