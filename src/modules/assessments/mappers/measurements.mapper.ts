import type { SchemaOutput } from '@/packages/schema';

import type { measurementHistoryResponseSchema } from '../schemas/measurements.schema';
import type { MeasurementProtocolHistory } from '../types/assessments.types';

type HistoryDto = SchemaOutput<typeof measurementHistoryResponseSchema>;

/** Project the grouped history; attempts keep recording order (oldest first). */
export function mapMeasurementHistory(dto: HistoryDto): readonly MeasurementProtocolHistory[] {
  return dto.entries.map((entry) => ({
    protocolId: entry.protocol.id,
    name: entry.protocol.name,
    unit: entry.protocol.unit,
    direction: entry.protocol.direction,
    method: entry.result.method,
    selected: entry.result.selected,
    consideredCount: entry.result.consideredCount,
    attempts: [...entry.attempts]
      .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))
      .map((attempt) => ({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        recordedAtIso: attempt.recordedAt,
        canonicalValue: attempt.canonicalValue,
        isCountable: attempt.valid && !attempt.disqualified,
      })),
  }));
}
