import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { matchStatisticsPath } from '../constants/matches-api.constants';
import { matchStatisticsResponseSchema } from '../schemas/match-statistics.schema';

type StatisticsDto = SchemaOutput<typeof matchStatisticsResponseSchema>;

/** The server-derived statistics projection for one match (backend 504). */
export function requestMatchStatistics(teamId: string, matchId: string): Promise<StatisticsDto> {
  return getAppHttpClient().get(
    matchStatisticsPath(teamId, matchId),
    matchStatisticsResponseSchema,
  );
}
