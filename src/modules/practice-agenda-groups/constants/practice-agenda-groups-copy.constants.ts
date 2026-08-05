import { I18N_KEYS } from '@/shared/i18n';

import { AGENDA_GROUP_OUTCOME, type AgendaGroupOutcome } from './practice-agenda-groups.constants';

const KEYS = I18N_KEYS.practiceAgendaGroups;

/** One i18n key per outcome, keyed by the same union the helpers resolve. */
export const AGENDA_GROUP_OUTCOME_COPY_KEYS: Readonly<Record<AgendaGroupOutcome, string>> = {
  [AGENDA_GROUP_OUTCOME.GroupCreated]: KEYS.groupCreated,
  [AGENDA_GROUP_OUTCOME.GroupRemoved]: KEYS.groupRemoved,
  [AGENDA_GROUP_OUTCOME.MemberAdded]: KEYS.memberAdded,
  [AGENDA_GROUP_OUTCOME.MemberRemoved]: KEYS.memberRemoved,
  [AGENDA_GROUP_OUTCOME.AgendaCopied]: KEYS.agendaCopied,
  [AGENDA_GROUP_OUTCOME.ActionFailed]: KEYS.actionFailed,
};
