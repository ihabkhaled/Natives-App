import type { MemberDirectoryItem, MemberRole } from '@/modules/members';
import { I18N_KEYS } from '@/shared/i18n';

import type { RolesPanelLabels } from '../types/admin-view.types';
import { buildMemberOptions, buildRoleToggles, describeCurrentRoles } from './roles-view.helper';

type Translate = (key: string) => string;

export interface RolesPanelInput {
  readonly membershipId: string;
  readonly hasRoles: boolean;
  readonly members: readonly MemberDirectoryItem[];
  readonly assignable: readonly MemberRole[];
  readonly selected: readonly MemberRole[];
  readonly reason: string;
  readonly isReasonValid: boolean;
  readonly onToggle: (role: MemberRole) => void;
}

/**
 * The role panel's labels and toggles. `assignable` is the server's privilege
 * ceiling verbatim: an empty ceiling produces an explicit statement rather
 * than an empty list the user could mistake for a loading state.
 */
export function buildRolesPanel(t: Translate, input: RolesPanelInput): RolesPanelLabels {
  return {
    memberLabel: t(I18N_KEYS.adminRoles.memberFilterLabel),
    memberValue: input.membershipId,
    memberOptions: buildMemberOptions(input.members),
    selectPrompt: t(I18N_KEYS.adminRoles.selectPrompt),
    hasSelection: input.membershipId !== '' && input.hasRoles,
    currentHeading: t(I18N_KEYS.adminRoles.currentHeading),
    currentLabel: describeCurrentRoles(t, input.selected),
    assignableHeading: t(I18N_KEYS.adminRoles.assignableHeading),
    ceilingNotice: t(I18N_KEYS.adminRoles.ceilingNotice),
    noAssignableLabel: input.assignable.length === 0 ? t(I18N_KEYS.adminRoles.noAssignable) : null,
    toggles: buildRoleToggles(t, input.selected, input.assignable, input.onToggle),
    reasonLabel: t(I18N_KEYS.adminRoles.reasonLabel),
    reasonPlaceholder: t(I18N_KEYS.adminRoles.reasonPlaceholder),
    reasonValue: input.reason,
    validationMessage: input.isReasonValid ? null : t(I18N_KEYS.adminRoles.reasonRequired),
    saveLabel: t(I18N_KEYS.adminRoles.saveRoles),
  };
}
