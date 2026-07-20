import type { SchemaOutput } from '@/packages/schema';

import type {
  availabilityListResponseSchema,
  availabilityResponseSchema,
  eligibilityReportResponseSchema,
  selectionListResponseSchema,
  selectionResponseSchema,
  squadListResponseSchema,
  squadResponseSchema,
} from '../schemas/squad.schema';
import type {
  EligibilityReport,
  Squad,
  SquadAvailability,
  SquadAvailabilityPage,
  SquadPage,
  SquadSelection,
  SquadSelectionPage,
} from '../types/competitions.types';

type SquadDto = SchemaOutput<typeof squadResponseSchema>;
type SquadListDto = SchemaOutput<typeof squadListResponseSchema>;
type EligibilityDto = SchemaOutput<typeof eligibilityReportResponseSchema>;
type SelectionDto = SchemaOutput<typeof selectionResponseSchema>;
type SelectionListDto = SchemaOutput<typeof selectionListResponseSchema>;
type AvailabilityDto = SchemaOutput<typeof availabilityResponseSchema>;
type AvailabilityListDto = SchemaOutput<typeof availabilityListResponseSchema>;

export function mapSquad(dto: SquadDto): Squad {
  return {
    squadId: dto.squadId,
    competitionId: dto.competitionId,
    name: dto.name,
    status: dto.status,
    attendanceThresholdPct: dto.attendanceThresholdPct,
    policyVersion: dto.policyVersion,
    selectionDeadline: dto.selectionDeadline,
    notes: dto.notes,
    revision: dto.revision,
    recordVersion: dto.recordVersion,
  };
}

export function mapSquadPage(dto: SquadListDto): SquadPage {
  return { total: dto.total, items: dto.items.map((item) => mapSquad(item)) };
}

/**
 * The advisory eligibility report. Every nullable measurement is carried over
 * untouched so the view can say "not enough data" instead of printing a zero.
 */
export function mapEligibilityReport(dto: EligibilityDto): EligibilityReport {
  return {
    squadId: dto.squadId,
    policyVersion: dto.policyVersion,
    attendanceThresholdPct: dto.attendanceThresholdPct,
    total: dto.total,
    selectedGenderRatio: { ...dto.selectedGenderRatio },
    candidates: dto.candidates.map((candidate) => ({
      membershipId: candidate.membershipId,
      fullName: candidate.fullName,
      jerseyNumber: candidate.jerseyNumber,
      attendancePct: candidate.attendancePct,
      availability: candidate.availability,
      selected: candidate.selected,
      overall: candidate.overall,
      flagged: candidate.flagged,
      signals: candidate.signals.map((signal) => ({ code: signal.code, status: signal.status })),
    })),
  };
}

export function mapSelection(dto: SelectionDto): SquadSelection {
  return {
    selectionId: dto.selectionId,
    membershipId: dto.membershipId,
    selectionRole: dto.selectionRole,
    status: dto.status,
    eligibilityOverridden: dto.eligibilityOverridden,
    overrideReason: dto.overrideReason,
    recordVersion: dto.recordVersion,
  };
}

export function mapSelectionPage(dto: SelectionListDto): SquadSelectionPage {
  return { total: dto.total, items: dto.items.map((item) => mapSelection(item)) };
}

export function mapAvailability(dto: AvailabilityDto): SquadAvailability {
  return {
    availabilityId: dto.availabilityId,
    membershipId: dto.membershipId,
    availability: dto.availability,
    reason: dto.reason,
    source: dto.source,
    updatedAt: dto.updatedAt,
  };
}

export function mapAvailabilityPage(dto: AvailabilityListDto): SquadAvailabilityPage {
  return { total: dto.total, items: dto.items.map((item) => mapAvailability(item)) };
}
