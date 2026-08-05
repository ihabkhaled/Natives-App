import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { RSVP_STATUS_FILTER_OPTIONS, RSVP_STATUS_LABEL_KEYS } from '../constants/practice-rsvp-detail-copy.constants';
import { RSVP_STATUS_FILTER_ALL } from '../constants/practice-rsvp-detail.constants';
import type {
  RsvpDetailPanel,
  RsvpDetailScreenView,
  RsvpFieldOption,
} from '../types/practice-rsvp-detail-view.types';
import type { RsvpParticipant, RsvpSummary } from '../types/practice-rsvp-detail.types';
import {
  buildHistoryPanelView,
  type RsvpHistoryPanelInput,
} from './rsvp-history-panel.helper';
import {
  buildOverridePanelView,
  type RsvpOverrideDraft,
  type RsvpOverrideDraftActions,
} from './rsvp-override-panel.helper';
import { buildRosterRows, type RosterRowActions } from './rsvp-roster-row.helper';
import { buildSummaryView } from './rsvp-summary-view.helper';

type Translate = (key: string, params?: TranslateParams) => string;

const KEYS = I18N_KEYS.practiceRsvpDetail;

/** The detail panel a coach has opened for one member, or none at all. */
export type RsvpDetailPanelInput =
  | { readonly kind: 'none' }
  | { readonly kind: 'override'; readonly draft: RsvpOverrideDraft; readonly actions: RsvpOverrideDraftActions }
  | { readonly kind: 'history'; readonly history: RsvpHistoryPanelInput };

/** Everything the screen needs that is not copy. */
export interface RsvpDetailViewInput {
  readonly locale: string;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly summary: RsvpSummary | undefined;
  readonly participants: readonly RsvpParticipant[];
  readonly total: number;
  readonly statusFilter: string;
  readonly onStatusFilterChange: (value: string) => void;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly onLoadMore: () => void;
  readonly rosterActions: RosterRowActions;
  readonly panel: RsvpDetailPanelInput;
}

/** Static copy — the strings that never depend on server state. */
function buildChrome(
  t: Translate,
): Pick<RsvpDetailScreenView, 'title' | 'subtitle' | 'loadingLabel' | 'errorTitle' | 'errorMessage'> {
  return {
    title: t(KEYS.title),
    subtitle: t(KEYS.subtitle),
    loadingLabel: t(KEYS.loadingLabel),
    errorTitle: t(KEYS.errorTitle),
    errorMessage: t(KEYS.errorMessage),
  };
}

/** "All" first, then every status a roster row can carry. */
function buildStatusFilterOptions(t: Translate): readonly RsvpFieldOption[] {
  return [
    { value: RSVP_STATUS_FILTER_ALL, label: t(KEYS.statusFilterAll) },
    ...RSVP_STATUS_FILTER_OPTIONS.map((status) => ({
      value: status,
      label: t(RSVP_STATUS_LABEL_KEYS[status]),
    })),
  ];
}

/** The roster list: its rows, the match count, and the "load more" step. */
function buildRosterSection(
  t: Translate,
  input: RsvpDetailViewInput,
): Pick<
  RsvpDetailScreenView,
  | 'statusFilterLabel'
  | 'statusFilterOptions'
  | 'statusFilter'
  | 'onStatusFilterChange'
  | 'countLabel'
  | 'rows'
  | 'emptyLabel'
  | 'hasMore'
  | 'isLoadingMore'
  | 'loadMoreLabel'
  | 'onLoadMore'
> {
  return {
    statusFilterLabel: t(KEYS.statusFilterLabel),
    statusFilterOptions: buildStatusFilterOptions(t),
    statusFilter: input.statusFilter,
    onStatusFilterChange: input.onStatusFilterChange,
    countLabel: t(KEYS.rosterCountLabel, { count: input.total }),
    rows: buildRosterRows(t, input.locale, input.participants, input.rosterActions),
    emptyLabel: t(KEYS.rosterEmpty),
    hasMore: input.hasMore,
    isLoadingMore: input.isLoadingMore,
    loadMoreLabel: t(KEYS.loadMoreAction),
    onLoadMore: input.onLoadMore,
  };
}

/** Resolve the one open panel — override, history, or none — into its view. */
function buildPanel(t: Translate, locale: string, panel: RsvpDetailPanelInput): RsvpDetailPanel {
  if (panel.kind === 'override') {
    return { kind: 'override', panel: buildOverridePanelView(t, panel.draft, panel.actions) };
  }
  if (panel.kind === 'history') {
    return { kind: 'history', panel: buildHistoryPanelView(t, locale, panel.history) };
  }
  return { kind: 'none' };
}

/**
 * Assemble the whole view from five focused builders.
 *
 * Extracted from the screen hook so the hook only wires queries, mutations
 * and selection state, and every piece of copy resolution is testable
 * without rendering.
 */
export function buildRsvpDetailView(t: Translate, input: RsvpDetailViewInput): RsvpDetailScreenView {
  return {
    ...buildChrome(t),
    ...buildRosterSection(t, input),
    isLoading: input.isLoading,
    isForbidden: input.isForbidden,
    hasError: input.hasError,
    summary: buildSummaryView(t, input.summary),
    panel: buildPanel(t, input.locale, input.panel),
  };
}
