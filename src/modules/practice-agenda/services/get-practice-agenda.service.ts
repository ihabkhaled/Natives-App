import { requestPracticeAgenda } from '../gateways/practice-agenda.gateway';
import type { AgendaRequestParams, PracticeAgenda } from '../types/practice-agenda.types';

/** The session's plan, exactly as the server holds it. */
export function getPracticeAgenda(params: AgendaRequestParams): Promise<PracticeAgenda> {
  return requestPracticeAgenda(params);
}
