import type { drillResponseSchema, listDrillsResponseSchema } from '@/modules/drills';
import type { SchemaOutput } from '@/packages/schema';

type DrillDto = SchemaOutput<typeof drillResponseSchema>;
type DrillListDto = SchemaOutput<typeof listDrillsResponseSchema>;

export const MOCK_DRILLS = {
  activeId: '21000000-0000-4000-8000-000000000001',
  archivedId: '21000000-0000-4000-8000-000000000002',
} as const;

function drill(overrides: Partial<DrillDto> & { id: string }): DrillDto {
  return {
    seasonId: null,
    name: 'Give-and-go break',
    category: 'throwing',
    objective: 'Build first-throw decision speed under light pressure.',
    instructions: 'Pairs exchange give-and-go passes moving upfield; rotate every 90 seconds.',
    equipment: ['cones', 'discs'],
    intensity: 'moderate',
    defaultDurationMinutes: 15,
    skillTags: ['throwing', 'footwork'],
    safetyNotes: null,
    mediaUrl: null,
    status: 'active',
    version: 1,
    ...overrides,
  };
}

let drills = new Map<string, DrillDto>();
let nextDrillSequence = 3;

/**
 * Two seeded drills covering the honest cases: one active and fully filled
 * in, one already archived (so the "visibly distinguishable, never hidden"
 * requirement has something real to prove against).
 */
export function resetMockDrillsState(): void {
  drills = new Map([
    [MOCK_DRILLS.activeId, drill({ id: MOCK_DRILLS.activeId })],
    [
      MOCK_DRILLS.archivedId,
      drill({
        id: MOCK_DRILLS.archivedId,
        name: 'Zone breakdown',
        category: 'defense',
        objective: 'Teach the zone shape before live reps.',
        instructions: 'Walk the shape at half speed, then live for two possessions.',
        equipment: ['cones'],
        intensity: 'low',
        defaultDurationMinutes: null,
        skillTags: ['defense'],
        status: 'archived',
        version: 2,
      }),
    ],
  ]);
  nextDrillSequence = 3;
}

resetMockDrillsState();

export function drillsResponse(): DrillListDto {
  const items = [...drills.values()];
  return { items, total: items.length, limit: 50, offset: 0 };
}

export function drillResponse(drillId: string): DrillDto | null {
  return drills.get(drillId) ?? null;
}

/** The wire shape `CreateDrillDto`/`UpdateDrillDto` actually send. */
export interface DrillWriteBody {
  readonly name?: string;
  readonly category?: string;
  readonly intensity?: string;
  readonly objective?: string;
  readonly instructions?: string;
  readonly equipment?: readonly string[];
  readonly skillTags?: readonly string[];
  readonly defaultDurationMinutes?: number;
  readonly safetyNotes?: string;
  readonly mediaUrl?: string;
  readonly seasonId?: string;
  readonly expectedVersion?: number;
}

function nextDrillId(): string {
  const id = `21000000-0000-4000-8000-0000000000${String(nextDrillSequence).padStart(2, '0')}`;
  nextDrillSequence += 1;
  return id;
}

interface WriteFallback {
  readonly name: string;
  readonly category: string;
  readonly intensity: string;
}

/** The five fields that always have a fallback: the caller's own value, or the record's. */
function resolveWriteCore(
  body: DrillWriteBody,
  fallback: WriteFallback,
): Pick<DrillDto, 'name' | 'category' | 'intensity' | 'objective' | 'instructions'> {
  return {
    name: body.name ?? fallback.name,
    category: (body.category ?? fallback.category) as DrillDto['category'],
    intensity: (body.intensity ?? fallback.intensity) as DrillDto['intensity'],
    objective: body.objective ?? null,
    instructions: body.instructions ?? null,
  };
}

/** The five fields that only ever come from the request itself, never a fallback record. */
function resolveWriteExtras(
  body: DrillWriteBody,
): Pick<
  DrillDto,
  'equipment' | 'skillTags' | 'defaultDurationMinutes' | 'safetyNotes' | 'mediaUrl'
> {
  return {
    equipment: [...(body.equipment ?? [])],
    skillTags: [...(body.skillTags ?? [])],
    defaultDurationMinutes: body.defaultDurationMinutes ?? null,
    safetyNotes: body.safetyNotes ?? null,
    mediaUrl: body.mediaUrl ?? null,
  };
}

export function createDrillRecord(body: DrillWriteBody): DrillDto {
  const created = drill({
    id: nextDrillId(),
    seasonId: body.seasonId ?? null,
    status: 'active',
    version: 1,
    ...resolveWriteCore(body, { name: '', category: 'other', intensity: 'moderate' }),
    ...resolveWriteExtras(body),
  });
  drills.set(created.id, created);
  return created;
}

/**
 * A stale `expectedVersion` is a conflict, exactly like the real API: the
 * update is refused rather than silently overwriting a change the caller
 * never saw.
 */
export function updateDrillRecord(
  drillId: string,
  body: DrillWriteBody,
): DrillDto | 'not-found' | 'conflict' {
  const record = drills.get(drillId);
  if (record === undefined) {
    return 'not-found';
  }
  if (body.expectedVersion !== undefined && body.expectedVersion !== record.version) {
    return 'conflict';
  }
  const updated: DrillDto = {
    ...record,
    ...resolveWriteCore(body, record),
    ...resolveWriteExtras(body),
    version: record.version + 1,
  };
  drills.set(drillId, updated);
  return updated;
}

/** Archive flips `status`; the record and its id are never removed. */
export function archiveDrillRecord(drillId: string): DrillDto | 'not-found' {
  const record = drills.get(drillId);
  if (record === undefined) {
    return 'not-found';
  }
  const archived: DrillDto = { ...record, status: 'archived', version: record.version + 1 };
  drills.set(drillId, archived);
  return archived;
}
