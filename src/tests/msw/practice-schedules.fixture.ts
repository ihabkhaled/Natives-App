type JsonObject = Record<string, unknown>;

/** Narrow an untyped mock request body field, falling back when it is absent or the wrong shape. */
function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function asNumberArray(value: unknown, fallback: readonly number[]): number[] {
  return Array.isArray(value) ? (value as number[]) : [...fallback];
}

function asStringArray(value: unknown, fallback: readonly string[]): string[] {
  return Array.isArray(value) ? (value as string[]) : [...fallback];
}

const DAY_MS = 86_400_000;

function isoDate(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

/** The one seed schedule every scenario starts from. */
const SEED_ID = 'schedule-mock-1';

interface MockSchedule {
  id: string;
  teamId: string;
  seasonId: string | null;
  name: string;
  sessionType: string;
  timezone: string;
  frequency: string;
  intervalWeeks: number;
  weekdays: number[];
  startTimeLocal: string;
  durationMinutes: number;
  meetOffsetMinutes: number | null;
  rsvpCutoffMinutes: number | null;
  defaultVenueId: string | null;
  defaultField: string | null;
  defaultCapacity: number | null;
  visibility: string;
  organizerUserId: string | null;
  notes: string | null;
  generationStart: string;
  generationUntil: string;
  exceptions: string[];
  status: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

function seedSchedule(): MockSchedule {
  return {
    id: SEED_ID,
    // Every mock persona's active membership resolves to this team id
    // (`buildAuthMembership`'s default) — match it so the list a signed-in
    // coach sees is not silently empty.
    teamId: 'team-natives',
    seasonId: 'season-2026-spring',
    name: 'Tuesday & Thursday practice',
    sessionType: 'practice',
    timezone: 'Africa/Cairo',
    frequency: 'weekly',
    intervalWeeks: 1,
    weekdays: [2, 4],
    startTimeLocal: '18:00',
    durationMinutes: 90,
    meetOffsetMinutes: 15,
    rsvpCutoffMinutes: 120,
    defaultVenueId: null,
    defaultField: null,
    defaultCapacity: 24,
    visibility: 'team',
    organizerUserId: 'user-coach',
    notes: null,
    generationStart: isoDate(-7),
    generationUntil: isoDate(21),
    exceptions: [],
    status: 'active',
    createdBy: 'user-coach',
    updatedBy: 'user-coach',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    version: 1,
  };
}

let schedules: MockSchedule[] = [seedSchedule()];
/** Which schedules a `generate` call has already run for once, for idempotency. */
let generatedFor = new Set<string>();
let nextId = 1;

export function resetMockScheduleState(): void {
  schedules = [seedSchedule()];
  generatedFor = new Set<string>();
  nextId = 1;
}

export function listMockSchedules(teamId: string): JsonObject {
  const items = schedules.filter((schedule) => schedule.teamId === teamId);
  return { items, total: items.length, limit: 20, offset: 0 };
}

export function findMockSchedule(scheduleId: string): MockSchedule | undefined {
  return schedules.find((schedule) => schedule.id === scheduleId);
}

export function createMockSchedule(teamId: string, body: JsonObject): MockSchedule {
  const created: MockSchedule = {
    id: `schedule-mock-${String((nextId += 1))}`,
    teamId,
    seasonId: asNullableString(body['seasonId']),
    name: asString(body['name'], ''),
    sessionType: asString(body['sessionType'], ''),
    timezone: asString(body['timezone'], 'Africa/Cairo'),
    frequency: asString(body['frequency'], 'weekly'),
    intervalWeeks: asNumber(body['intervalWeeks'], 1),
    weekdays: asNumberArray(body['weekdays'], []),
    startTimeLocal: asString(body['startTimeLocal'], ''),
    durationMinutes: asNumber(body['durationMinutes'], 60),
    meetOffsetMinutes: asNullableNumber(body['meetOffsetMinutes']),
    rsvpCutoffMinutes: asNullableNumber(body['rsvpCutoffMinutes']),
    defaultVenueId: asNullableString(body['defaultVenueId']),
    defaultField: asNullableString(body['defaultField']),
    defaultCapacity: asNullableNumber(body['defaultCapacity']),
    visibility: asString(body['visibility'], 'team'),
    organizerUserId: asNullableString(body['organizerUserId']),
    notes: asNullableString(body['notes']),
    generationStart: asString(body['generationStart'], isoDate(0)),
    generationUntil: asString(body['generationUntil'], isoDate(30)),
    exceptions: asStringArray(body['exceptions'], []),
    status: 'active',
    createdBy: 'user-coach',
    updatedBy: 'user-coach',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    version: 1,
  };
  schedules.push(created);
  return created;
}

export type UpdateOutcome =
  | { readonly kind: 'ok'; readonly schedule: MockSchedule }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'conflict' };

export function updateMockSchedule(scheduleId: string, body: JsonObject): UpdateOutcome {
  const existing = findMockSchedule(scheduleId);
  if (existing === undefined) {
    return { kind: 'not-found' };
  }
  if (body['expectedVersion'] !== existing.version) {
    return { kind: 'conflict' };
  }
  const updated: MockSchedule = {
    ...existing,
    name: asString(body['name'], existing.name),
    sessionType: asString(body['sessionType'], existing.sessionType),
    frequency: asString(body['frequency'], existing.frequency),
    weekdays: asNumberArray(body['weekdays'], existing.weekdays),
    intervalWeeks: asNumber(body['intervalWeeks'], existing.intervalWeeks),
    startTimeLocal: asString(body['startTimeLocal'], existing.startTimeLocal),
    durationMinutes: asNumber(body['durationMinutes'], existing.durationMinutes),
    timezone: asString(body['timezone'], existing.timezone),
    generationStart: asString(body['generationStart'], existing.generationStart),
    generationUntil: asString(body['generationUntil'], existing.generationUntil),
    visibility: asString(body['visibility'], existing.visibility),
    defaultCapacity: asNullableNumber(body['defaultCapacity']) ?? existing.defaultCapacity,
    notes: asNullableString(body['notes']) ?? existing.notes,
    status: asString(body['status'], existing.status),
    updatedAt: nowIso(),
    version: existing.version + 1,
  };
  schedules = schedules.map((schedule) => (schedule.id === scheduleId ? updated : schedule));
  return { kind: 'ok', schedule: updated };
}

export function archiveMockSchedule(scheduleId: string): MockSchedule | undefined {
  const existing = findMockSchedule(scheduleId);
  if (existing === undefined) {
    return undefined;
  }
  const archived: MockSchedule = {
    ...existing,
    status: 'archived',
    updatedAt: nowIso(),
    version: existing.version + 1,
  };
  schedules = schedules.map((schedule) => (schedule.id === scheduleId ? archived : schedule));
  return archived;
}

/** One fake generated session, shaped like `PracticeSessionResponseDto`. */
function mockSession(schedule: MockSchedule, index: number): JsonObject {
  const startsAt = new Date(Date.now() + index * DAY_MS).toISOString();
  return {
    cancellationReason: null,
    capacity: schedule.defaultCapacity,
    createdAt: nowIso(),
    createdBy: 'user-coach',
    endsAt: new Date(Date.parse(startsAt) + schedule.durationMinutes * 60_000).toISOString(),
    field: schedule.defaultField,
    id: `session-generated-${schedule.id}-${String(index)}`,
    meetAt: null,
    notes: null,
    occurrenceDate: startsAt.slice(0, 10),
    organizerUserId: schedule.organizerUserId,
    rsvpCutoffAt: null,
    scheduleId: schedule.id,
    seasonId: schedule.seasonId,
    sessionType: schedule.sessionType,
    startsAt,
    status: 'published',
    teamId: schedule.teamId,
    timezone: schedule.timezone,
    updatedAt: nowIso(),
    updatedBy: 'user-coach',
    venueId: schedule.defaultVenueId,
    version: 1,
    visibility: schedule.visibility,
  };
}

const MOCK_OCCURRENCES_PER_RUN = 3;

/**
 * Idempotent, like the real endpoint: the first call for a schedule creates
 * occurrences, every later call reports them all as skipped rather than
 * creating duplicates.
 */
export function generateMockSessions(scheduleId: string): JsonObject | undefined {
  const schedule = findMockSchedule(scheduleId);
  if (schedule === undefined) {
    return undefined;
  }
  if (generatedFor.has(scheduleId)) {
    return { created: 0, skipped: MOCK_OCCURRENCES_PER_RUN, sessions: [] };
  }
  generatedFor.add(scheduleId);
  const sessions = Array.from({ length: MOCK_OCCURRENCES_PER_RUN }, (_unused, index) =>
    mockSession(schedule, index),
  );
  return { created: sessions.length, skipped: 0, sessions };
}
