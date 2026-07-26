import { useState } from 'react';

import type { TranslateParams } from '@/packages/i18n';
import type { SelectFieldOption } from '@/shared/ui';
import { I18N_KEYS } from '@/shared/i18n';

import {
  buildManualStandingDraft,
  toManualStandingCommand,
  validateManualStandingDraft,
  type ManualStandingDraft,
} from '../helpers/manual-standing-form.helper';
import { buildStandingsManageView } from '../helpers/standings-screen-view.helper';
import { resolveStandingsWriteErrorKey } from '../helpers/to-standings-error.helper';
import { useRecomputeStandingsMutation } from '../mutations/use-recompute-standings-mutation.hook';
import { useRecordManualStandingMutation } from '../mutations/use-record-manual-standing-mutation.hook';
import type { StandingsRecomputeReport } from '../types/standings.types';
import type { StandingsManageView } from '../types/standings-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

interface ManageHookInput {
  readonly teamId: string;
  readonly canManage: boolean;
  readonly isOffline: boolean;
  readonly ruleOptions: readonly SelectFieldOption[];
  readonly activeCompetitionId: string;
  readonly onBanner: (message: string) => void;
}

export interface StandingsManageApi {
  readonly manage: StandingsManageView | null;
}

/**
 * The recompute + reconciled-external-row concern of the standings screen,
 * owned as a sub-hook so the screen hook stays thin. Both writes report a
 * banner up to the screen; provenance is mandatory on the manual row.
 */
export function useStandingsManage(t: Translate, input: ManageHookInput): StandingsManageApi {
  const [isRecomputeOpen, setRecomputeOpen] = useState(false);
  const [recomputeRuleKey, setRecomputeRuleKey] = useState('');
  const [isManualOpen, setManualOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState<ManualStandingDraft>(buildManualStandingDraft);
  const [writeError, setWriteError] = useState<string | null>(null);

  const recompute = useRecomputeStandingsMutation(input.teamId, {
    onSuccess: (report: StandingsRecomputeReport) => {
      setRecomputeOpen(false);
      input.onBanner(
        report.finalizedMatches === 0
          ? t(I18N_KEYS.standings.recomputeReportEmpty)
          : t(I18N_KEYS.standings.recomputeReport, {
              matches: String(report.finalizedMatches),
              entrants: String(report.entrants),
            }),
      );
    },
    onError: (error) => {
      setWriteError(t(resolveStandingsWriteErrorKey(error, I18N_KEYS.standings.recomputeFailed)));
    },
  });
  const manual = useRecordManualStandingMutation(input.teamId, {
    onSuccess: () => {
      setManualOpen(false);
      setManualDraft(buildManualStandingDraft());
      input.onBanner(t(I18N_KEYS.standings.manualSaved));
    },
    onError: (error) => {
      setWriteError(t(resolveStandingsWriteErrorKey(error, I18N_KEYS.standings.manualFailed)));
    },
  });

  const manage = buildStandingsManageView(t, {
    canManage: input.canManage,
    isOffline: input.isOffline,
    ruleOptions: input.ruleOptions,
    isRecomputeOpen,
    recomputeRuleKey,
    isRecomputeRunning: recompute.isRunning,
    onRecomputeRuleChange: setRecomputeRuleKey,
    onRecomputeConfirm: () => {
      recompute.run({ competitionId: input.activeCompetitionId, ruleKey: recomputeRuleKey });
    },
    onRecomputeCancel: () => {
      setRecomputeOpen(false);
    },
    onOpenRecompute: () => {
      setWriteError(null);
      setRecomputeOpen(true);
    },
    isManualOpen,
    manualDraft,
    manualIssue: validateManualStandingDraft(manualDraft),
    manualWriteError: writeError,
    isManualSaving: manual.isRunning,
    onManualPatch: (patch) => {
      setManualDraft((current) => ({ ...current, ...patch }));
    },
    onManualSubmit: () => {
      manual.run(toManualStandingCommand(manualDraft, input.activeCompetitionId));
    },
    onManualCancel: () => {
      setManualOpen(false);
    },
    onOpenManual: () => {
      setWriteError(null);
      setManualOpen(true);
    },
  });

  return { manage };
}
