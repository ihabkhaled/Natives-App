/** Deterministic tryout identifiers shared by the fixtures and the tests. */
export const MOCK_TRYOUTS = {
  teamId: 'team-natives',
  openEventId: 'f0000000-0000-4000-8000-000000000001',
  fullEventId: 'f0000000-0000-4000-8000-000000000002',
  registeredCandidateId: 'f1000000-0000-4000-8000-000000000001',
  checkedInCandidateId: 'f1000000-0000-4000-8000-000000000002',
  acceptedCandidateId: 'f1000000-0000-4000-8000-000000000003',
  convertedCandidateId: 'f1000000-0000-4000-8000-000000000004',
  duplicateEmail: 'already@example.test',
  consentVersion: 'tryout-consent-v1',
} as const;
