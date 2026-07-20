import { describe, expect, it } from 'vitest';

import {
  availabilityResponse,
  eligibilityResponse,
  MOCK_SQUADS,
  selectionsResponse,
  squadResponse,
  squadsResponse,
} from '@/tests/msw/squads.fixture';

import {
  mapAvailability,
  mapAvailabilityPage,
  mapEligibilityReport,
  mapSelection,
  mapSelectionPage,
  mapSquad,
  mapSquadPage,
} from './squad.mapper';

describe('mapSquad and mapSquadPage', () => {
  it('carries the policy, revision, and version tokens through', () => {
    const squad = mapSquad(squadResponse(MOCK_SQUADS.draftId)!);

    expect(squad).toMatchObject({
      squadId: MOCK_SQUADS.draftId,
      status: 'draft',
      policyVersion: 'squad-policy-v3',
      attendanceThresholdPct: 70,
      revision: 1,
    });
  });

  it('maps a full page without losing its total', () => {
    const page = mapSquadPage(squadsResponse());

    expect(page.items).toHaveLength(page.total);
    expect(page.items.map((item) => item.status)).toContain('locked');
  });
});

describe('mapEligibilityReport', () => {
  it('preserves a null attendance instead of substituting a zero', () => {
    const report = mapEligibilityReport(eligibilityResponse(MOCK_SQUADS.draftId));
    const unknown = report.candidates.find(
      (candidate) => candidate.membershipId === MOCK_SQUADS.unknownMembershipId,
    );

    expect(unknown?.attendancePct).toBeNull();
    expect(unknown?.availability).toBeNull();
    expect(unknown?.jerseyNumber).toBeNull();
    expect(unknown?.overall).toBe('unknown');
  });

  it('carries every advisory signal for a failing candidate', () => {
    const report = mapEligibilityReport(eligibilityResponse(MOCK_SQUADS.draftId));
    const failed = report.candidates.find(
      (candidate) => candidate.membershipId === MOCK_SQUADS.failedMembershipId,
    );

    expect(failed?.overall).toBe('failed');
    expect(failed?.signals).toContainEqual({ code: 'attendance', status: 'failed' });
  });

  it('keeps the selected-squad gender ratio', () => {
    const report = mapEligibilityReport(eligibilityResponse(MOCK_SQUADS.draftId));

    expect(report.selectedGenderRatio.total).toBeGreaterThanOrEqual(0);
    expect(report.policyVersion).toBe('squad-policy-v3');
  });
});

describe('mapSelection and mapAvailability', () => {
  it('keeps the override provenance on a selection', () => {
    const page = mapSelectionPage(selectionsResponse());
    const first = page.items[0]!;

    expect(mapSelection(selectionsResponse().items[0]!)).toEqual(first);
    expect(first.eligibilityOverridden).toBe(false);
    expect(first.overrideReason).toBeNull();
  });

  it('keeps the availability source and reason', () => {
    const page = mapAvailabilityPage(availabilityResponse());
    const first = page.items[0]!;

    expect(mapAvailability(availabilityResponse().items[0]!)).toEqual(first);
    expect(first.source).toBe('self');
  });
});
