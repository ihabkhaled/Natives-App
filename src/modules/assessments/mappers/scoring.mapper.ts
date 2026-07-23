import type { SchemaOutput } from '@/packages/schema';

import type { scoreListResponseSchema } from '../schemas/scoring.schema';
import type { MyPerformanceScore } from '../types/assessments.types';

type ScoreListDto = SchemaOutput<typeof scoreListResponseSchema>;
type ScoreDto = ScoreListDto['items'][number];

function mapScore(dto: ScoreDto): MyPerformanceScore {
  return {
    id: dto.id,
    value: dto.value,
    confidence: dto.confidence,
    completeness: dto.completeness,
    status: dto.status,
    ruleKey: dto.ruleKey,
    ruleVersion: dto.ruleVersion,
    computedAtIso: dto.computedAt,
    components: (dto.explanation?.components ?? []).map((component) => ({
      categoryKey: component.categoryKey,
      weight: component.weight,
      display: component.display,
      included: component.included,
    })),
  };
}

/** The newest score, or null when nothing has been computed for the caller. */
export function mapMyPerformanceScore(dto: ScoreListDto): MyPerformanceScore | null {
  const first = dto.items[0];
  return first === undefined ? null : mapScore(first);
}
