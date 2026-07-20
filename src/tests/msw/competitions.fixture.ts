import type {
  competitionListResponseSchema,
  competitionStructureResponseSchema,
  fixtureListResponseSchema,
  opponentListResponseSchema,
} from '@/modules/competitions';
import type { SchemaOutput } from '@/packages/schema';

type CompetitionListDto = SchemaOutput<typeof competitionListResponseSchema>;
type CompetitionDto = CompetitionListDto['items'][number];
type StructureDto = SchemaOutput<typeof competitionStructureResponseSchema>;
type FixtureListDto = SchemaOutput<typeof fixtureListResponseSchema>;
type OpponentListDto = SchemaOutput<typeof opponentListResponseSchema>;

export const MOCK_COMPETITIONS = {
  teamId: 'team-natives',
  seasonId: '50000000-0000-4000-8000-000000000001',
  leagueId: '60000000-0000-4000-8000-000000000001',
  championshipId: '60000000-0000-4000-8000-000000000002',
  cancelledId: '60000000-0000-4000-8000-000000000003',
  opponentAId: '70000000-0000-4000-8000-000000000001',
  opponentBId: '70000000-0000-4000-8000-000000000002',
  archivedOpponentId: '70000000-0000-4000-8000-000000000003',
} as const;

const CREATED_AT = '2026-06-01T09:00:00.000Z';
const UPDATED_AT = '2026-07-05T09:00:00.000Z';

function competition(
  overrides: Partial<CompetitionDto> & { competitionId: string },
): CompetitionDto {
  return {
    teamId: MOCK_COMPETITIONS.teamId,
    seasonId: MOCK_COMPETITIONS.seasonId,
    name: 'Cairo Ultimate League',
    competitionType: 'league',
    status: 'active',
    genderDivision: 'mixed',
    organizerName: 'Egyptian Flying Disc Federation',
    externalRef: null,
    startsOn: '2026-09-04',
    endsOn: '2026-12-18',
    description: 'Nine-week mixed league. Two games per match day, self-refereed.',
    cancellationReason: null,
    recordVersion: 3,
    publishedAt: CREATED_AT,
    activatedAt: CREATED_AT,
    completedAt: null,
    cancelledAt: null,
    archivedAt: null,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}

/**
 * Three competitions covering the states the list must present honestly: an
 * active league, a draft championship with no published dates, and a
 * cancelled friendly that carries its reason.
 */
const COMPETITIONS: CompetitionDto[] = [
  competition({ competitionId: MOCK_COMPETITIONS.leagueId }),
  competition({
    competitionId: MOCK_COMPETITIONS.championshipId,
    name: 'National Championship 2026',
    competitionType: 'championship',
    status: 'draft',
    startsOn: null,
    endsOn: null,
    organizerName: null,
    genderDivision: null,
    description: null,
    publishedAt: null,
    activatedAt: null,
  }),
  competition({
    competitionId: MOCK_COMPETITIONS.cancelledId,
    name: 'Alexandria Beach Friendly',
    competitionType: 'friendly',
    status: 'cancelled',
    cancellationReason: 'Venue withdrew the pitch booking.',
    cancelledAt: UPDATED_AT,
  }),
];

const STRUCTURE: StructureDto = {
  stages: [
    {
      stageId: '80000000-0000-4000-8000-000000000002',
      competitionId: MOCK_COMPETITIONS.leagueId,
      name: 'Knockout',
      stageFormat: 'knockout',
      ordinal: 2,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    },
    {
      stageId: '80000000-0000-4000-8000-000000000001',
      competitionId: MOCK_COMPETITIONS.leagueId,
      name: 'Group stage',
      stageFormat: 'group',
      ordinal: 1,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    },
  ],
  rounds: [
    {
      roundId: '90000000-0000-4000-8000-000000000001',
      stageId: '80000000-0000-4000-8000-000000000001',
      competitionId: MOCK_COMPETITIONS.leagueId,
      name: 'Round 1',
      ordinal: 1,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    },
    {
      roundId: '90000000-0000-4000-8000-000000000002',
      stageId: '80000000-0000-4000-8000-000000000001',
      competitionId: MOCK_COMPETITIONS.leagueId,
      name: 'Round 2',
      ordinal: 2,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    },
  ],
};

const FIXTURES: FixtureListDto['items'] = [
  {
    fixtureId: 'a0000000-0000-4000-8000-000000000001',
    competitionId: MOCK_COMPETITIONS.leagueId,
    teamId: MOCK_COMPETITIONS.teamId,
    seasonId: MOCK_COMPETITIONS.seasonId,
    stageId: '80000000-0000-4000-8000-000000000001',
    roundId: '90000000-0000-4000-8000-000000000001',
    opponentId: MOCK_COMPETITIONS.opponentAId,
    venueId: 'Maadi Club pitch 2',
    homeAway: 'home',
    scheduledAt: '2026-09-04T15:00:00.000Z',
    scheduledAtCairo: '2026-09-04 17:00',
    timezone: 'Africa/Cairo',
    status: 'scheduled',
    rescheduleCount: 0,
    previousScheduledAt: null,
    rescheduleReason: null,
    cancellationReason: null,
    recordVersion: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    fixtureId: 'a0000000-0000-4000-8000-000000000002',
    competitionId: MOCK_COMPETITIONS.leagueId,
    teamId: MOCK_COMPETITIONS.teamId,
    seasonId: MOCK_COMPETITIONS.seasonId,
    stageId: '80000000-0000-4000-8000-000000000001',
    roundId: '90000000-0000-4000-8000-000000000002',
    opponentId: MOCK_COMPETITIONS.opponentBId,
    venueId: null,
    homeAway: 'away',
    scheduledAt: '2026-09-11T15:00:00.000Z',
    scheduledAtCairo: '2026-09-11 17:00',
    timezone: 'Africa/Cairo',
    status: 'rescheduled',
    rescheduleCount: 1,
    previousScheduledAt: '2026-09-10T15:00:00.000Z',
    rescheduleReason: 'Opponent travel delay',
    cancellationReason: null,
    recordVersion: 2,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
];

const OPPONENTS: OpponentListDto['items'] = [
  {
    opponentId: MOCK_COMPETITIONS.opponentAId,
    teamId: MOCK_COMPETITIONS.teamId,
    name: 'Nile Nomads',
    shortName: 'NIL',
    logoRef: null,
    notes: null,
    status: 'active',
    recordVersion: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    opponentId: MOCK_COMPETITIONS.opponentBId,
    teamId: MOCK_COMPETITIONS.teamId,
    name: 'Delta Discs',
    shortName: null,
    logoRef: null,
    notes: null,
    status: 'active',
    recordVersion: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
  {
    opponentId: MOCK_COMPETITIONS.archivedOpponentId,
    teamId: MOCK_COMPETITIONS.teamId,
    name: 'Sinai Sailors',
    shortName: 'SIN',
    logoRef: null,
    notes: null,
    status: 'archived',
    recordVersion: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  },
];

export function competitionsResponse(): CompetitionListDto {
  return { items: COMPETITIONS, total: COMPETITIONS.length, limit: 50, offset: 0 };
}

export function competitionResponse(competitionId: string): CompetitionDto | null {
  return COMPETITIONS.find((item) => item.competitionId === competitionId) ?? null;
}

export function competitionStructureResponse(competitionId: string): StructureDto {
  return competitionId === MOCK_COMPETITIONS.leagueId ? STRUCTURE : { stages: [], rounds: [] };
}

export function competitionFixturesResponse(competitionId: string): FixtureListDto {
  const items = competitionId === MOCK_COMPETITIONS.leagueId ? FIXTURES : [];
  return { items, total: items.length, limit: 50, offset: 0 };
}

export function opponentsResponse(): OpponentListDto {
  return { items: OPPONENTS, total: OPPONENTS.length, limit: 50, offset: 0 };
}
