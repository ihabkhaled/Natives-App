import { RSVP_STATUS } from '@/modules/practice';

import {
  buildInitialSessions,
  CONFLICT_SESSION_ID,
  type DetailDto,
} from './practice-session-data.fixture';

type SummaryDto = ReturnType<typeof toSummary>;
type CountsDto = DetailDto['counts'];

let sessions: DetailDto[] = buildInitialSessions();

export function resetMockPracticeState(): void {
  sessions = buildInitialSessions();
}

function toSummary(detail: DetailDto) {
  return {
    id: detail.id,
    type: detail.type,
    title: detail.title,
    status: detail.status,
    startAt: detail.startAt,
    endAt: detail.endAt,
    meetAt: detail.meetAt,
    rsvpDeadlineAt: detail.rsvpDeadlineAt,
    venueName: detail.venue === null ? null : detail.venue.name,
    capacity: detail.capacity,
    myRsvpStatus: detail.rsvp.status,
    waitlisted: detail.rsvp.waitlisted,
    changeKind: detail.changeKind,
  };
}

export interface PracticeListQuery {
  readonly scope: string;
  readonly type: string | null;
  readonly rsvp: string | null;
  readonly pageSize: number;
}

function inScope(detail: DetailDto, scope: string, nowMs: number): boolean {
  const startMs = new Date(detail.startAt).getTime();
  if (scope === 'upcoming') {
    return startMs >= nowMs;
  }
  if (scope === 'past') {
    return startMs < nowMs;
  }
  return true;
}

function matchesFilters(detail: DetailDto, query: PracticeListQuery): boolean {
  const typeOk = query.type === null || detail.type === query.type;
  const rsvpOk = query.rsvp === null || detail.rsvp.status === query.rsvp;
  return typeOk && rsvpOk && inScope(detail, query.scope, Date.now());
}

/** Filtered, deterministically ordered, bounded calendar page. */
export function buildPracticeListResponse(query: PracticeListQuery) {
  const filtered = sessions
    .filter((detail) => matchesFilters(detail, query))
    .sort((left, right) => left.startAt.localeCompare(right.startAt));
  const items = filtered.slice(0, query.pageSize).map(toSummary);
  return {
    items,
    page: 1,
    pageSize: query.pageSize,
    total: filtered.length,
    hasMore: filtered.length > query.pageSize,
  };
}

/** Bounded upcoming list (offline-cacheable). */
export function buildUpcomingResponse(): { items: SummaryDto[] } {
  const nowMs = Date.now();
  const items = sessions
    .filter((detail) => new Date(detail.startAt).getTime() >= nowMs)
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, 5)
    .map(toSummary);
  return { items };
}

export function findPracticeDetail(sessionId: string): DetailDto | undefined {
  return sessions.find((detail) => detail.id === sessionId);
}

export interface RsvpSubmissionBody {
  readonly status: string;
  readonly reasonCategory: string | null;
  readonly version: number;
}

export type RsvpApplyResult =
  | { readonly kind: 'ok'; readonly detail: DetailDto }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'conflict' }
  | { readonly kind: 'deadline' };

const COUNT_KEY: Record<string, keyof NonNullable<CountsDto> | null> = {
  [RSVP_STATUS.going]: 'going',
  [RSVP_STATUS.maybe]: 'maybe',
  [RSVP_STATUS.notGoing]: 'notGoing',
  [RSVP_STATUS.noResponse]: null,
};

function recomputeCounts(detail: DetailDto, previous: string, next: string): void {
  const counts = detail.counts;
  if (counts === null || previous === next) {
    return;
  }
  const prevKey = COUNT_KEY[previous] ?? null;
  const nextKey = COUNT_KEY[next] ?? null;
  if (prevKey !== null && counts[prevKey] > 0) {
    counts[prevKey] -= 1;
  }
  if (nextKey !== null) {
    counts[nextKey] += 1;
  }
}

function isDeadlinePassed(detail: DetailDto): boolean {
  return detail.rsvp.deadlineAt !== null && new Date(detail.rsvp.deadlineAt).getTime() < Date.now();
}

/** Apply a self-RSVP write with deadline, version, and capacity rules. */
export function applyRsvp(sessionId: string, body: RsvpSubmissionBody): RsvpApplyResult {
  const detail = findPracticeDetail(sessionId);
  if (detail === undefined) {
    return { kind: 'not-found' };
  }
  if (sessionId === CONFLICT_SESSION_ID || body.version !== detail.rsvp.version) {
    return { kind: 'conflict' };
  }
  if (isDeadlinePassed(detail)) {
    return { kind: 'deadline' };
  }
  recomputeCounts(detail, detail.rsvp.status, body.status);
  detail.rsvp = {
    ...detail.rsvp,
    status: body.status as DetailDto['rsvp']['status'],
    reasonCategory: body.reasonCategory as DetailDto['rsvp']['reasonCategory'],
    respondedAt: new Date().toISOString(),
    version: detail.rsvp.version + 1,
  };
  detail.updatedAt = new Date().toISOString();
  return { kind: 'ok', detail };
}
