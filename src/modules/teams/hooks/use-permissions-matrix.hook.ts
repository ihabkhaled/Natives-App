import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { buildScreenCopy, resolveScreenStatus, toRemoteQueryView } from '@/shared/view';

import {
  ALL_AREAS,
  buildAreaOptions,
  buildMatrixColumns,
  buildMatrixRows,
} from '../helpers/permissions-matrix.helper';
import { MATRIX_SCREEN_COPY } from '../helpers/teams-copy.helper';
import { buildRoleMatrixQueryOptions } from '../queries/teams.query';
import type { RoleMatrix } from '../types/teams.types';
import type { PermissionsMatrixView } from '../types/teams-view.types';
import { useTeamsContext } from './use-teams-context.hook';

/**
 * The catalog x role-bundle matrix, read-only.
 *
 * It answers the only question an administrator actually has when a screen is
 * unexpectedly forbidden: which bundle grants that permission. The data is the
 * server's seeded catalog, stamped with its policy version, so the answer is
 * never a client-side guess about what a role "probably" includes.
 */
export function usePermissionsMatrix(): PermissionsMatrixView {
  const { t } = useAppTranslation();
  const context = useTeamsContext();
  const [area, setArea] = useState<string>(ALL_AREAS);
  const query = toRemoteQueryView(
    useAppQuery<RoleMatrix>(buildRoleMatrixQueryOptions(context.teamId, context.canReadRoleMatrix)),
  );
  const rows = buildMatrixRows(t, query.data, area);
  return {
    ...buildScreenCopy(t, {
      keys: MATRIX_SCREEN_COPY,
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.permissionsMatrix.emptyTitle,
      emptyMessageKey: I18N_KEYS.permissionsMatrix.emptyMessage,
    }),
    title: t(I18N_KEYS.permissionsMatrix.title),
    subtitle: t(I18N_KEYS.permissionsMatrix.subtitle),
    status: resolveScreenStatus(context, query, context.canReadRoleMatrix, rows.length > 0),
    notice: t(I18N_KEYS.permissionsMatrix.readOnlyNotice),
    policyVersionLabel: `${t(I18N_KEYS.permissionsMatrix.policyVersionLabel)}: ${String(
      query.data?.policyVersion ?? 0,
    )}`,
    permissionColumnLabel: t(I18N_KEYS.permissionsMatrix.permissionColumn),
    countSummary: t(I18N_KEYS.permissionsMatrix.countSummary, { count: rows.length }),
    areaLabel: t(I18N_KEYS.permissionsMatrix.areaFilterLabel),
    area,
    areaOptions: buildAreaOptions(t, query.data),
    onAreaChange: setArea,
    systemRoleLabel: t(I18N_KEYS.permissionsMatrix.systemRoleLabel),
    columns: buildMatrixColumns(query.data),
    rows,
  };
}
