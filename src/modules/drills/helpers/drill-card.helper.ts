import type { TranslateParams } from '@/packages/i18n';

import {
  DRILL_CATEGORY_LABEL_KEYS,
  DRILL_INTENSITY_LABEL_KEYS,
  DRILL_STATUS_LABEL_KEYS,
  DRILL_STATUS_TONE,
} from '../constants/drills-labels.constants';
import type { Drill } from '../types/drills.types';
import type { DrillCardView } from '../types/drills-view.types';
import { formatDrillDuration, formatTagsSummary } from './drill-format.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/**
 * One catalogue entry projected into a fully-translated card. The status
 * label and tone travel together so an archived drill reads as retired
 * everywhere it appears, rather than only on its own detail screen.
 */
export function buildDrillCard(t: Translate, drill: Drill): DrillCardView {
  return {
    id: drill.id,
    name: drill.name,
    categoryLabel: t(DRILL_CATEGORY_LABEL_KEYS[drill.category]),
    intensityLabel: t(DRILL_INTENSITY_LABEL_KEYS[drill.intensity]),
    durationLabel: formatDrillDuration(t, drill.defaultDurationMinutes),
    statusLabel: t(DRILL_STATUS_LABEL_KEYS[drill.status]),
    statusTone: DRILL_STATUS_TONE[drill.status],
    tagsSummary: formatTagsSummary(t, drill.skillTags),
    ariaLabel: drill.name,
  };
}
