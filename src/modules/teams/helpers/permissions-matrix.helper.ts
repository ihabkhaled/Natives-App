import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { RoleMatrix } from '../types/teams.types';
import type { MatrixColumnView, MatrixRowView } from '../types/teams-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Sentinel meaning "do not narrow by area". */
export const ALL_AREAS = 'all';

/** The area filter's options: every distinct area in the catalog, sorted. */
export function buildAreaOptions(
  t: Translate,
  matrix: RoleMatrix | undefined,
): readonly { value: string; label: string }[] {
  const areas = [...new Set((matrix?.permissions ?? []).map((entry) => entry.area))].sort(
    (left, right) => left.localeCompare(right),
  );
  return [
    { value: ALL_AREAS, label: t(I18N_KEYS.permissionsMatrix.allAreas) },
    ...areas.map((area) => ({ value: area, label: area })),
  ];
}

/** One column per role bundle, in the order the catalog returns them. */
export function buildMatrixColumns(matrix: RoleMatrix | undefined): readonly MatrixColumnView[] {
  return (matrix?.roles ?? []).map((role) => ({
    key: role.key,
    label: role.displayName,
    isSystem: role.isSystem,
  }));
}

/**
 * One row per permission, with a granted/not-granted cell per role bundle.
 * Membership is computed from each bundle's own permission list, so the screen
 * shows what the seeded catalog actually says rather than a client guess.
 */
export function buildMatrixRows(
  t: Translate,
  matrix: RoleMatrix | undefined,
  area: string,
): readonly MatrixRowView[] {
  const roles = matrix?.roles ?? [];
  const grants = new Map(roles.map((role) => [role.key, new Set(role.permissions)]));
  return (matrix?.permissions ?? [])
    .filter((entry) => area === ALL_AREAS || entry.area === area)
    .map((entry) => ({
      key: entry.key,
      permission: entry.key,
      area: entry.area,
      description: entry.description,
      cells: roles.map((role) => {
        const isGranted = grants.get(role.key)?.has(entry.key) === true;
        return {
          roleKey: role.key,
          isGranted,
          label: t(
            isGranted
              ? I18N_KEYS.permissionsMatrix.grantedLabel
              : I18N_KEYS.permissionsMatrix.notGrantedLabel,
          ),
        };
      }),
    }));
}
