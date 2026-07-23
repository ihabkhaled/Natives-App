import { I18N_KEYS } from '@/shared/i18n';

import type { SuperAdmin } from '../types/admin.types';
import type { SuperAdminRowView } from '../types/admin-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;
type FormatInstant = (iso: string) => string;

export interface RevokeCapability {
  readonly canRevoke: boolean;
  readonly onRevoke: (userId: string, email: string) => void;
}

/**
 * One super administrator per row: who they are, since when, and who granted
 * it — the facts an audit review asks first. Revoke stays visible even when
 * momentarily disabled, so the capability is never hidden state.
 */
export function buildSuperAdminRows(
  t: Translate,
  formatInstant: FormatInstant,
  items: readonly SuperAdmin[],
  revoke: RevokeCapability,
): readonly SuperAdminRowView[] {
  return items.map((item) => ({
    userId: item.userId,
    name: item.displayName ?? item.email,
    email: item.email,
    sinceLabel: t(I18N_KEYS.adminPlatform.sinceLabel, {
      since: formatInstant(item.effectiveFromIso),
    }),
    grantedByLabel:
      item.grantedBy === null
        ? t(I18N_KEYS.adminPlatform.grantedBySystem)
        : t(I18N_KEYS.adminPlatform.grantedByLabel, { actor: item.grantedBy }),
    revokeLabel: t(I18N_KEYS.adminPlatform.revokeAction),
    canRevoke: revoke.canRevoke,
    onRevoke: () => {
      revoke.onRevoke(item.userId, item.email);
    },
  }));
}
