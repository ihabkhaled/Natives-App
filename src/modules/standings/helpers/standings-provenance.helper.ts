import { formatDate } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { StandingRow } from '../types/standings.types';
import type { ProvenanceView } from '../types/standings-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/**
 * The provenance popover of a manual or imported row. Derived rows carry no
 * popover: their provenance is the recompute itself, cited in the footer.
 * A manual row's reconciliation note is mandatory at the API, so an absent
 * note can only mean a derived row.
 */
export function buildProvenanceView(
  t: Translate,
  locale: string,
  row: StandingRow,
): ProvenanceView | null {
  if (row.source === 'derived' || row.reconciliationNote === null) {
    return null;
  }
  return {
    heading: t(I18N_KEYS.standings.provenanceHeading),
    note: row.reconciliationNote,
    reference:
      row.sourceReference === null
        ? null
        : t(I18N_KEYS.standings.provenanceReference, { reference: row.sourceReference }),
    recordedBy:
      row.recordedBy === null
        ? null
        : t(I18N_KEYS.standings.provenanceRecordedBy, { actor: row.recordedBy }),
    computedAt: t(I18N_KEYS.standings.provenanceComputedAt, {
      date: formatDate(row.computedAtIso, locale),
    }),
    toggleLabel: t(I18N_KEYS.standings.provenanceToggle),
  };
}
