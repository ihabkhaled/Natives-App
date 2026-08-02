import { formatCairoDate } from '@/packages/date';
import type { AppTranslation } from '@/packages/i18n';
import { formatNumber } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';

import { publicCompetitionDetailPath } from '../routes/public-competitions.paths';
import type { PublicCompetitionCardView } from '../types/public-competitions-view.types';
import type { PublicCompetitionSummaryDto } from '../types/public-showcase.types';

type Translate = AppTranslation['t'];

/**
 * Render a date range as one string, or null when the organiser has not
 * published either end of it. A single published date is shown alone rather
 * than padded into a range that pretends to know the other end.
 */
function toDateRangeText(
  startDate: string | null,
  endDate: string | null,
  locale: string,
): string | null {
  const start = startDate === null ? null : formatCairoDate(startDate, locale);
  const end = endDate === null ? null : formatCairoDate(endDate, locale);
  if (start === null) {
    return end;
  }
  if (end === null || end === start) {
    return start;
  }
  return `${start} – ${end}`;
}

/**
 * Competition summary → card view. `rank === null` survives as
 * `rankText: null` and is reported through `isResultPending`, so the screen
 * can say "results pending" instead of printing a zero or a dash that reads
 * like a placing. The year is stringified rather than group-formatted: 2026
 * is a label, not a quantity, and `formatNumber` would render it "2,026".
 */
export function toPublicCompetitionCardView(
  dto: PublicCompetitionSummaryDto,
  locale: string,
  t: Translate,
): PublicCompetitionCardView {
  return {
    key: dto.slug,
    slug: dto.slug,
    name: dto.name,
    yearText: String(dto.year),
    formatText: dto.format,
    locationText: dto.location,
    datesText: toDateRangeText(dto.startDate, dto.endDate, locale),
    rankText: dto.rank === null ? null : formatNumber(dto.rank, locale),
    entrantsText:
      dto.entrantCount === null
        ? null
        : t(I18N_KEYS.publicCompetitions.finishOfEntrants, {
            entrants: formatNumber(dto.entrantCount, locale),
          }),
    isResultPending: dto.rank === null,
    detailPath: publicCompetitionDetailPath(dto.slug),
  };
}
