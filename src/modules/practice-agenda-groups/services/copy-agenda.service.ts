import type { AgendaSummary } from '@/modules/practice-agenda';

import { requestAgendaCopy } from '../gateways/practice-agenda-groups.gateway';
import type { CopyAgendaCommand } from '../types/practice-agenda-groups.types';

/** Replace this session's agenda with another session's, rather than rebuilding it. */
export function copyAgenda(command: CopyAgendaCommand): Promise<AgendaSummary> {
  return requestAgendaCopy(command);
}
