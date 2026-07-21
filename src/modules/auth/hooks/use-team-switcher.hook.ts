import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useQueryClient } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';

import {
  buildTeamOptions,
  canSwitchTeams,
  type TeamOptionView,
} from '../helpers/team-switcher.helper';
import { useActiveTeamStore } from '../store/active-team.store';
import { useActiveTeamScope } from './use-active-team-scope.hook';
import { useCurrentUserQuery } from './use-current-user-query.hook';

export interface TeamSwitcherView {
  /** False for a single-team principal: the control collapses entirely. */
  readonly isAvailable: boolean;
  readonly isOpen: boolean;
  readonly label: string;
  readonly ariaLabel: string;
  readonly activeTeamName: string;
  readonly activeTeamDetail: string | null;
  readonly options: readonly TeamOptionView[];
  readonly onToggle: () => void;
  readonly onSelect: (teamId: string) => void;
}

/**
 * The signed-in principal's team switcher.
 *
 * Switching rewrites the scope every team-scoped query key is built from, so
 * the whole server cache is invalidated on the way out: query keys carry the
 * team id, but data already fetched under the previous scope would otherwise
 * stay on screen until each key happened to refetch. Invalidating everything is
 * deliberate and cheap — practically all of this app's server state is
 * team-scoped, and a stale cross-team read is a correctness bug, not a
 * cosmetic one.
 */
export function useTeamSwitcher(): TeamSwitcherView {
  const { t } = useAppTranslation();
  const currentUser = useCurrentUserQuery();
  const scope = useActiveTeamScope();
  const selectTeam = useActiveTeamStore((state) => state.selectTeam);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const memberships = currentUser.user?.memberships ?? [];
  const options = buildTeamOptions(memberships, scope.teamId);
  return {
    isAvailable: canSwitchTeams(memberships),
    isOpen,
    label: t(I18N_KEYS.teams.switcherLabel),
    ariaLabel: t(I18N_KEYS.teams.switcherAriaLabel),
    activeTeamName: scope.teamName,
    activeTeamDetail: options.find((option) => option.isActive)?.detail ?? null,
    options,
    onToggle: () => {
      setIsOpen((open) => !open);
    },
    onSelect: (teamId) => {
      setIsOpen(false);
      if (teamId !== scope.teamId) {
        selectTeam(teamId);
        void queryClient.invalidateQueries();
      }
    },
  };
}
