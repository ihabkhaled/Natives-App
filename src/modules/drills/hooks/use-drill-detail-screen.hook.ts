import { useMemo } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { useConfirmAlert } from '@/shared/ui';
import { toRemoteQueryView } from '@/shared/view';

import { DRILL_NEW_ID } from '../constants/drills.constants';
import { buildDrillDetailView } from '../helpers/drill-detail-view.helper';
import {
  buildDrillFormDefaultValues,
  toCreateDrillCommand,
  toUpdateDrillCommand,
} from '../helpers/drill-form.helper';
import { buildDrillFormView } from '../helpers/drill-form-view.helper';
import { buildDrillQueryOptions } from '../queries/drills.query';
import { DRILL_ID_PARAM, drillDetailPath, drillsPath } from '../routes/drills.paths';
import type { Drill, DrillFormValues } from '../types/drills.types';
import type { DrillDetailScreenView } from '../types/drills-view.types';
import { useDrillForm } from './use-drill-form.hook';
import { useDrillsContext } from './use-drills-context.hook';
import { useDrillWriteMutations } from './use-drill-write-mutations.hook';

const KEYS = I18N_KEYS.drills;

/** The active vs. archived heading key never needs a hook — it is one lookup. */
function resolveFormHeadingKey(isCreateMode: boolean): string {
  return isCreateMode ? KEYS.newHeading : KEYS.formHeading;
}

/**
 * The drill detail/edit screen. The `:drillId` route accepts the `new`
 * sentinel (`DRILL_NEW_ID`), which renders a blank form and skips the read —
 * that is what lets one screen serve create, view and edit without a third
 * route.
 */
export function useDrillDetailScreen(): DrillDetailScreenView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const { confirm } = useConfirmAlert();
  const context = useDrillsContext();
  const drillId = useRouteParam(DRILL_ID_PARAM) ?? '';
  const isCreateMode = drillId === DRILL_NEW_ID;

  const detailQuery = useAppQuery<Drill>(buildDrillQueryOptions(context.teamId, drillId));
  const view = toRemoteQueryView(detailQuery);
  const drill = isCreateMode ? null : (detailQuery.data ?? null);
  const defaultValues = useMemo(
    () => buildDrillFormDefaultValues(isCreateMode ? null : (detailQuery.data ?? null)),
    [isCreateMode, detailQuery.data],
  );

  const writes = useDrillWriteMutations({
    teamId: context.teamId,
    onCreated: (created) => {
      navigation.push(drillDetailPath(created.id));
    },
    onConflict: () => {
      view.refetch();
    },
  });

  const form = useDrillForm({
    values: defaultValues,
    onValidSubmit: (values: DrillFormValues) => {
      if (isCreateMode) {
        writes.create.run(toCreateDrillCommand(context.teamId, values));
        return;
      }
      if (drill !== null) {
        writes.update.run(toUpdateDrillCommand(context.teamId, drillId, drill.version, values));
      }
    },
  });

  const onArchive = (): void => {
    void confirm({
      header: t(KEYS.archiveConfirmTitle),
      message: t(KEYS.archiveConfirmMessage),
      confirmLabel: t(KEYS.archiveConfirm),
      cancelLabel: t(KEYS.archiveCancel),
    }).then((confirmed) => {
      if (confirmed && drill !== null) {
        writes.archive.run({ teamId: context.teamId, drillId: drill.id });
      }
    });
  };

  return buildDrillDetailView(t, {
    drill,
    isCreateMode,
    isContextLoading: context.isLoading,
    isQueryLoading: view.isLoading,
    queryError: view.error,
    isOffline: context.isOffline,
    permitted: context.canManage,
    onRetry: view.refetch,
    onBack: () => {
      navigation.push(drillsPath());
    },
    form: buildDrillFormView(t, {
      ...form,
      isSubmitting: writes.create.isRunning || writes.update.isRunning,
      onCancel: () => {
        navigation.push(drillsPath());
      },
      heading: t(resolveFormHeadingKey(isCreateMode)),
    }),
    isArchiving: writes.archive.isRunning,
    onArchive,
  });
}
