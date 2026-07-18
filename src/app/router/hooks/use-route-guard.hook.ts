import { useEffectivePermissions, useSession } from '@/modules/auth';
import { useAppTranslation } from '@/packages/i18n';
import { hasAllPermissions } from '@/shared/security';
import type { AppRouteDefinition } from '@/shared/types';

import { presentGuardStatus } from '../guard-presentation.helper';
import { toGuardInstruction } from '../guard-instruction.helper';
import type { GuardInstruction } from '../guarded-route.types';
import { resolveRouteAccess } from '../route-access.helper';
import { normalizeRouteMeta } from '../route-meta.helper';

/**
 * Resolves a route into a render instruction. Waits for the restored session
 * and effective permissions before deciding, so a protected screen never
 * flashes before its guard has the facts.
 */
export function useRouteGuard(definition: AppRouteDefinition): GuardInstruction {
  const session = useSession();
  const effective = useEffectivePermissions();
  const { t } = useAppTranslation();
  const meta = normalizeRouteMeta(definition.meta);
  const status = resolveRouteAccess({
    access: definition.access,
    isSessionResolved: session.isResolved,
    isAuthenticated: session.isAuthenticated,
    isProfileReady: !session.isAuthenticated || !effective.isLoading,
    isProfileErrored: effective.isError,
    featureEnabled: meta.featureEnabled,
    accountActive: effective.accountActive,
    onboardingComplete: effective.onboardingComplete,
    requiresTeamContext: meta.requiresTeamContext,
    hasTeamContext: effective.hasTeamContext,
    hasRequiredPermissions: hasAllPermissions(effective.permissions, meta.requiredPermissions),
  });
  return toGuardInstruction(presentGuardStatus(status), definition.component, t);
}
