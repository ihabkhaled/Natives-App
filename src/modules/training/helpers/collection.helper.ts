import type {
  ActivityType,
  ActivityTypeCatalog,
  TrainingBuddy,
  TrainingEvidence,
  TrainingSubmission,
  TrainingSubmissionDetail,
} from '../types/training.types';

/** A bounded page reduced to the two fields every list screen reads. */
export interface BoundedPage<TItem> {
  readonly items: readonly TItem[];
  readonly total: number;
}

/** An absent page is an empty page — never a page of fabricated rows. */
export function readPage<TItem>(page: BoundedPage<TItem> | undefined): BoundedPage<TItem> {
  return page ?? { items: [], total: 0 };
}

export function readActivityTypes(
  catalog: ActivityTypeCatalog | undefined,
): readonly ActivityType[] {
  return catalog?.items ?? [];
}

export function findActivityType(
  types: readonly ActivityType[],
  activityTypeId: string | undefined,
): ActivityType | null {
  return types.find((item) => item.id === activityTypeId) ?? null;
}

/** Activity-type id → display name, for rows that only carry the id. */
export function buildTypeNameMap(types: readonly ActivityType[]): ReadonlyMap<string, string> {
  return new Map(types.map((item) => [item.id, item.name]));
}

export function readSubmission(
  detail: TrainingSubmissionDetail | undefined,
): TrainingSubmission | null {
  return detail?.submission ?? null;
}

export function readBuddies(
  detail: TrainingSubmissionDetail | undefined,
): readonly TrainingBuddy[] {
  return detail?.buddies ?? [];
}

export function readEvidence(
  evidence: readonly TrainingEvidence[] | undefined,
): readonly TrainingEvidence[] {
  return evidence ?? [];
}

/** Narrow the caller's own claims to one status, or keep them all. */
export function filterByStatus(
  items: readonly TrainingSubmissionDetail[],
  status: string,
  allValue: string,
): readonly TrainingSubmissionDetail[] {
  return status === allValue ? items : items.filter((item) => item.submission.status === status);
}
