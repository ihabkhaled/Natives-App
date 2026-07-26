import type { TranslateParams } from '@/packages/i18n';
import type { AppError } from '@/shared/errors/app.errors';
import type { SelectFieldOption } from '@/shared/ui';
import type { RemoteQueryView } from '@/shared/view';
import { resolveScreenStatus } from '@/shared/view';
import { I18N_KEYS } from '@/shared/i18n';

import type { Competition } from '@/modules/competitions';
import type { ManualStandingDraft, ManualStandingIssue } from './manual-standing-form.helper';
import { buildStandingsScreenCopy } from './standings-copy.helper';
import {
  buildManualFormView,
  buildRecomputeDialogView,
  buildSourceOptions,
  manualIssueMessage,
} from './standings-table-view.helper';
import {
  buildRuleFooter,
  buildStandingRowViews,
  buildStandingsColumns,
} from './standings-view.helper';
import type { StandingRow, StandingsPage, StandingsRule } from '../types/standings.types';
import type { StandingsManageView, StandingsScreenView } from '../types/standings-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The recompute/manual state + callbacks the manage panel binds. */
export interface StandingsManageDeps {
  readonly canManage: boolean;
  readonly isOffline: boolean;
  readonly ruleOptions: readonly SelectFieldOption[];
  readonly isRecomputeOpen: boolean;
  readonly recomputeRuleKey: string;
  readonly isRecomputeRunning: boolean;
  readonly onRecomputeRuleChange: (value: string) => void;
  readonly onRecomputeConfirm: () => void;
  readonly onRecomputeCancel: () => void;
  readonly onOpenRecompute: () => void;
  readonly isManualOpen: boolean;
  readonly manualDraft: ManualStandingDraft;
  readonly manualIssue: ManualStandingIssue;
  readonly manualWriteError: string | null;
  readonly isManualSaving: boolean;
  readonly onManualPatch: (patch: Partial<ManualStandingDraft>) => void;
  readonly onManualSubmit: () => void;
  readonly onManualCancel: () => void;
  readonly onOpenManual: () => void;
}

/** The competition.manage affordances, or null for read-only personas. */
export function buildStandingsManageView(
  t: Translate,
  deps: StandingsManageDeps,
): StandingsManageView | null {
  if (!deps.canManage) {
    return null;
  }
  return {
    recomputeLabel: t(I18N_KEYS.standings.recomputeOpen),
    onOpenRecompute: deps.onOpenRecompute,
    manualLabel: t(I18N_KEYS.standings.manualOpen),
    onOpenManual: deps.onOpenManual,
    disabledReason: deps.isOffline ? t(I18N_KEYS.standings.offlineMessage) : null,
    recomputeDialog: !deps.isRecomputeOpen
      ? null
      : buildRecomputeDialogView(t, {
          ruleValue: deps.recomputeRuleKey,
          ruleOptions: deps.ruleOptions,
          isOffline: deps.isOffline,
          isRunning: deps.isRecomputeRunning,
          onRuleChange: deps.onRecomputeRuleChange,
          onConfirm: deps.onRecomputeConfirm,
          onCancel: deps.onRecomputeCancel,
        }),
    manualForm: !deps.isManualOpen
      ? null
      : buildManualFormView(t, {
          draft: deps.manualDraft,
          ruleOptions: deps.ruleOptions,
          validationMessage: manualIssueMessage(t, deps.manualIssue, deps.manualWriteError),
          canSubmit: deps.manualIssue === null && !deps.isOffline,
          isSaving: deps.isManualSaving,
          patch: deps.onManualPatch,
          onSubmit: deps.onManualSubmit,
          onCancel: deps.onManualCancel,
        }),
  };
}

/** The filters, table, and footer slice of the standings screen. */
interface StandingsChromeDeps {
  readonly locale: string;
  readonly competitions: readonly Competition[];
  readonly activeCompetitionId: string;
  readonly source: string;
  readonly rows: readonly StandingRow[];
  readonly rules: readonly StandingsRule[];
  readonly onCompetitionChange: (value: string) => void;
  readonly onSourceChange: (value: string) => void;
  readonly onOpenRules: () => void;
}

function buildStandingsChrome(t: Translate, deps: StandingsChromeDeps) {
  return {
    title: t(I18N_KEYS.standings.title),
    subtitle: t(I18N_KEYS.standings.subtitle),
    competitionLabel: t(I18N_KEYS.standings.competitionLabel),
    competitionValue: deps.activeCompetitionId,
    competitionOptions: deps.competitions.map((competition) => ({
      value: competition.competitionId,
      label: competition.name,
    })),
    onCompetitionChange: deps.onCompetitionChange,
    sourceLabel: t(I18N_KEYS.standings.sourceLabel),
    sourceValue: deps.source,
    sourceOptions: buildSourceOptions(t),
    onSourceChange: deps.onSourceChange,
    tableCaption: t(I18N_KEYS.standings.tableCaption),
    columns: buildStandingsColumns(t),
    rows: buildStandingRowViews(t, deps.locale, deps.rows),
    diffDerivedNote: t(I18N_KEYS.standings.diffDerivedNote),
    ruleFooter: buildRuleFooter(t, deps.rows, deps.rules),
    rulesLinkLabel: t(I18N_KEYS.standings.rulesLink),
    onOpenRules: deps.onOpenRules,
  };
}

/** Everything the standings screen needs, assembled once. */
export interface StandingsScreenDeps {
  readonly context: {
    readonly isOffline: boolean;
    readonly isLoading: boolean;
    readonly canRead: boolean;
    readonly canManage: boolean;
  };
  readonly tableQuery: RemoteQueryView<StandingsPage>;
  readonly competitionsQuery: RemoteQueryView<unknown>;
  readonly rows: readonly StandingRow[];
  readonly onRetry: () => void;
  readonly chrome: StandingsChromeDeps;
  readonly manage: StandingsManageView | null;
  readonly recomputeBanner: string | null;
}

export function buildStandingsScreenView(
  t: Translate,
  deps: StandingsScreenDeps,
): StandingsScreenView {
  const mergedError: AppError | null = deps.tableQuery.error ?? deps.competitionsQuery.error;
  const query: RemoteQueryView<StandingsPage> = {
    data: deps.tableQuery.data,
    isLoading: deps.tableQuery.isLoading && deps.competitionsQuery.error === null,
    error: mergedError,
    refetch: deps.onRetry,
  };
  return {
    ...buildStandingsScreenCopy(t, {
      error: mergedError,
      isOffline: deps.context.isOffline,
      onRetry: deps.onRetry,
      emptyTitleKey: I18N_KEYS.standings.emptyTitle,
      emptyMessageKey: deps.context.canManage
        ? I18N_KEYS.standings.emptyManageMessage
        : I18N_KEYS.standings.emptyMessage,
    }),
    status: resolveScreenStatus(deps.context, query, deps.context.canRead, deps.rows.length > 0),
    ...buildStandingsChrome(t, deps.chrome),
    recomputeBanner: deps.recomputeBanner,
    manage: deps.manage,
  };
}
