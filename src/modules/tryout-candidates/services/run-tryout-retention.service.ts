import { requestTryoutRetention } from '../gateways/tryout-candidates.gateway';
import type { TryoutRetentionReport } from '../types/tryout-candidates.types';

/**
 * Anonymizes every candidate past their retention window.
 *
 * Consumed but not yet surfaced: the sweep is irreversible and bulk, and this
 * module has no copy of its own to state that plainly before it runs. Shipping
 * a button labelled with a sentence borrowed from another domain would be
 * exactly the kind of guessing the rest of this module refuses to do. See the
 * README's "Not built yet".
 */
export function runTryoutRetention(teamId: string): Promise<TryoutRetentionReport> {
  return requestTryoutRetention(teamId);
}
