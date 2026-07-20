import type { SchemaOutput } from '@/packages/schema';

import type {
  rosterEntryListResponseSchema,
  rosterEntryResponseSchema,
  rosterListResponseSchema,
  rosterResponseSchema,
  rosterSnapshotListResponseSchema,
  rosterValidationResponseSchema,
} from '../schemas/roster.schema';
import type {
  Roster,
  RosterEntry,
  RosterEntryPage,
  RosterPage,
  RosterSnapshotPage,
  RosterValidation,
} from '../types/rosters.types';

type RosterDto = SchemaOutput<typeof rosterResponseSchema>;
type RosterListDto = SchemaOutput<typeof rosterListResponseSchema>;
type EntryDto = SchemaOutput<typeof rosterEntryResponseSchema>;
type EntryListDto = SchemaOutput<typeof rosterEntryListResponseSchema>;
type ValidationDto = SchemaOutput<typeof rosterValidationResponseSchema>;
type SnapshotListDto = SchemaOutput<typeof rosterSnapshotListResponseSchema>;

export function mapRoster(dto: RosterDto): Roster {
  return {
    rosterId: dto.rosterId,
    competitionId: dto.competitionId,
    fixtureId: dto.fixtureId,
    squadId: dto.squadId,
    rosterKind: dto.rosterKind,
    name: dto.name,
    status: dto.status,
    division: dto.division,
    minSize: dto.minSize,
    maxSize: dto.maxSize,
    minWomen: dto.minWomen,
    requireCaptain: dto.requireCaptain,
    policyVersion: dto.policyVersion,
    selectionDeadline: dto.selectionDeadline,
    notes: dto.notes,
    revision: dto.revision,
    recordVersion: dto.recordVersion,
    revisionReason: dto.revisionReason,
    lockedAt: dto.lockedAt,
  };
}

export function mapRosterPage(dto: RosterListDto): RosterPage {
  return { total: dto.total, items: dto.items.map((item) => mapRoster(item)) };
}

/** Nullable jersey and availability are carried through untouched. */
export function mapRosterEntry(dto: EntryDto): RosterEntry {
  return {
    entryId: dto.entryId,
    membershipId: dto.membershipId,
    jerseyNumber: dto.jerseyNumber,
    entryRole: dto.entryRole,
    lineAssignment: dto.lineAssignment,
    fieldPosition: dto.fieldPosition,
    genderBucket: dto.genderBucket,
    status: dto.status,
    availability: dto.availability,
    constraintOverridden: dto.constraintOverridden,
    overrideReason: dto.overrideReason,
    recordVersion: dto.recordVersion,
  };
}

export function mapRosterEntryPage(dto: EntryListDto): RosterEntryPage {
  return { total: dto.total, items: dto.items.map((item) => mapRosterEntry(item)) };
}

export function mapRosterValidation(dto: ValidationDto): RosterValidation {
  return {
    rosterId: dto.rosterId,
    policyVersion: dto.policyVersion,
    status: dto.status,
    composition: { ...dto.composition },
    publishable: dto.publishable,
    violations: dto.violations.map((violation) => ({ ...violation })),
  };
}

export function mapRosterSnapshotPage(dto: SnapshotListDto): RosterSnapshotPage {
  return {
    total: dto.total,
    items: dto.items.map((item) => ({
      snapshotId: item.snapshotId,
      revision: item.revision,
      reason: item.reason,
      rosterStatus: item.rosterStatus,
      entryCount: item.entryCount,
      takenAt: item.takenAt,
    })),
  };
}
