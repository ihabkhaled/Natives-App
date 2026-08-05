import { runRequest } from '@/shared/errors';

import { requestArchiveDrill } from '../gateways/drills.gateway';
import type { ArchiveDrillCommand, Drill } from '../types/drills.types';

/**
 * Use case: retire a drill. The record survives — a past agenda station can
 * still resolve it — so this flips `status`, it never deletes the row.
 */
export function archiveDrill(command: ArchiveDrillCommand): Promise<Drill> {
  return runRequest(() => requestArchiveDrill(command));
}
