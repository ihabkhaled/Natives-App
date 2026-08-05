import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

type Translate = (key: string, params?: TranslateParams) => string;

/** "45 min", or the honest "no default duration" when the coach never set one. */
export function formatDrillDuration(t: Translate, minutes: number | null): string {
  return minutes === null
    ? t(I18N_KEYS.drills.noDurationLabel)
    : t(I18N_KEYS.drills.durationLabel, { minutes });
}

/** The tag line, or the honest "no tags yet" placeholder for an untagged drill. */
export function formatTagsSummary(t: Translate, tags: readonly string[]): string {
  return tags.length === 0 ? t(I18N_KEYS.drills.noTagsLabel) : tags.join(', ');
}
