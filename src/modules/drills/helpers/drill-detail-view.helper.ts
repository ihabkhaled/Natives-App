import type { AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';
import type { AsyncViewStatus } from '@/shared/ui';
import { buildScreenCopy, resolveAsyncViewStatus } from '@/shared/view';

import { DRILL_DETAIL_SCREEN_COPY_KEYS } from '../constants/drills-copy.constants';
import { DRILL_STATUS } from '../constants/drills.constants';
import { DRILL_STATUS_LABEL_KEYS, DRILL_STATUS_TONE } from '../constants/drills-labels.constants';
import type { Drill } from '../types/drills.types';
import type {
  DrillDetailScreenView,
  DrillFormView,
  DrillLifecycleView,
} from '../types/drills-view.types';

type Translate = (key: string) => string;

/** Everything the detail/edit screen needs that is not itself copy or the form. */
export interface DrillDetailViewInput {
  readonly drill: Drill | null;
  readonly isCreateMode: boolean;
  readonly isContextLoading: boolean;
  readonly isQueryLoading: boolean;
  readonly queryError: AppError | null;
  readonly isOffline: boolean;
  readonly permitted: boolean;
  readonly onRetry: () => void;
  readonly onBack: () => void;
  readonly form: DrillFormView;
  readonly isArchiving: boolean;
  readonly onArchive: () => void;
}

/** Loading only means something once there is something to load. */
function resolveIsLoading(input: DrillDetailViewInput): boolean {
  if (input.isCreateMode) {
    return false;
  }
  return input.isContextLoading || input.isQueryLoading;
}

/** A blank create-mode form is never an error state, however the read failed. */
function resolveHasError(input: DrillDetailViewInput): boolean {
  return !input.isCreateMode && input.queryError !== null;
}

function resolveDetailStatus(input: DrillDetailViewInput): AsyncViewStatus {
  const hasData = input.isCreateMode || input.drill !== null;
  return resolveAsyncViewStatus({
    isForbidden: !input.isContextLoading && !input.permitted,
    isLoading: resolveIsLoading(input),
    hasError: resolveHasError(input),
    isOffline: input.isOffline,
    hasData,
    // A resolved detail record (or a blank create-mode form) is never "empty"
    // the way an unfiltered list can be — there is always exactly one record.
    hasItems: true,
  });
}

/** The page/heading text: a fixed label while creating, the drill's own name once loaded. */
function resolveHeading(t: Translate, input: DrillDetailViewInput): string {
  return input.isCreateMode ? t(I18N_KEYS.drills.newHeading) : (input.drill?.name ?? '');
}

/** The status chip's label and tone, or both null before a drill exists to show one for. */
function buildStatusChip(
  t: Translate,
  drill: Drill | null,
): { label: string | null; tone: string | null } {
  if (drill === null) {
    return { label: null, tone: null };
  }
  return { label: t(DRILL_STATUS_LABEL_KEYS[drill.status]), tone: DRILL_STATUS_TONE[drill.status] };
}

/**
 * The archive control. Absent for a drill that has no id yet (create mode)
 * and replaced by a plain notice once a drill is already archived — there is
 * nothing left to retire, and the notice says "archived", never "deleted",
 * because the record still backs every past agenda that references it.
 */
function buildLifecycle(t: Translate, input: DrillDetailViewInput): DrillLifecycleView {
  const isArchived = input.drill !== null && input.drill.status === DRILL_STATUS.Archived;
  return {
    visible: !input.isCreateMode && input.drill !== null && !isArchived,
    notice: isArchived ? t(I18N_KEYS.drills.archivedNotice) : null,
    actionLabel: t(I18N_KEYS.drills.archiveAction),
    isBusy: input.isArchiving,
    onArchive: input.onArchive,
  };
}

/**
 * Assemble the whole detail/edit screen view from focused builders.
 *
 * Split out of the screen hook so the hook only wires the query, the form and
 * the mutations, and every piece of copy resolution is testable without
 * rendering.
 */
export function buildDrillDetailView(
  t: Translate,
  input: DrillDetailViewInput,
): DrillDetailScreenView {
  const heading = resolveHeading(t, input);
  const statusChip = buildStatusChip(t, input.drill);
  return {
    ...buildScreenCopy(t, {
      keys: DRILL_DETAIL_SCREEN_COPY_KEYS,
      error: input.isCreateMode ? null : input.queryError,
      isOffline: input.isOffline,
      onRetry: input.onRetry,
      emptyTitleKey: I18N_KEYS.drills.emptyTitle,
      emptyMessageKey: I18N_KEYS.drills.emptyMessage,
    }),
    status: resolveDetailStatus(input),
    title: heading === '' ? t(I18N_KEYS.drills.detailTitle) : heading,
    heading,
    backLabel: t(I18N_KEYS.drills.backLabel),
    onBack: input.onBack,
    statusLabel: statusChip.label,
    statusTone: statusChip.tone,
    lifecycle: buildLifecycle(t, input),
    form: input.form,
  };
}
