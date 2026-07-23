import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { myPerformanceScorePath } from '../constants/assessments-api.constants';
import { scoreListResponseSchema } from '../schemas/scoring.schema';

type ScoreListDto = SchemaOutput<typeof scoreListResponseSchema>;

/** The signed-in player's own computed performance scores. */
export function requestMyPerformanceScore(teamId: string): Promise<ScoreListDto> {
  return getAppHttpClient().get(myPerformanceScorePath(teamId), scoreListResponseSchema);
}
