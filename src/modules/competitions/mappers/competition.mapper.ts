import type { SchemaOutput } from '@/packages/schema';

import type {
  competitionListResponseSchema,
  competitionResponseSchema,
  competitionStructureResponseSchema,
  fixtureListResponseSchema,
  opponentListResponseSchema,
} from '../schemas/competition.schema';
import type {
  Competition,
  CompetitionPage,
  CompetitionStructure,
  FixturePage,
  OpponentPage,
} from '../types/competitions.types';

type CompetitionDto = SchemaOutput<typeof competitionResponseSchema>;
type CompetitionListDto = SchemaOutput<typeof competitionListResponseSchema>;
type StructureDto = SchemaOutput<typeof competitionStructureResponseSchema>;
type FixtureListDto = SchemaOutput<typeof fixtureListResponseSchema>;
type OpponentListDto = SchemaOutput<typeof opponentListResponseSchema>;

/**
 * Wire DTO to app domain. The mapper drops fields the UI has no business
 * reading (opponent contact details, actor ids) and preserves every null.
 */
export function mapCompetition(dto: CompetitionDto): Competition {
  return {
    competitionId: dto.competitionId,
    name: dto.name,
    competitionType: dto.competitionType,
    status: dto.status,
    genderDivision: dto.genderDivision,
    organizerName: dto.organizerName,
    externalRef: dto.externalRef,
    startsOn: dto.startsOn,
    endsOn: dto.endsOn,
    description: dto.description,
    cancellationReason: dto.cancellationReason,
    recordVersion: dto.recordVersion,
  };
}

export function mapCompetitionPage(dto: CompetitionListDto): CompetitionPage {
  return { total: dto.total, items: dto.items.map((item) => mapCompetition(item)) };
}

/** Stages and rounds are returned unsorted; playing order is the ordinal. */
export function mapCompetitionStructure(dto: StructureDto): CompetitionStructure {
  return {
    stages: [...dto.stages]
      .sort((left, right) => left.ordinal - right.ordinal)
      .map((stage) => ({
        stageId: stage.stageId,
        name: stage.name,
        stageFormat: stage.stageFormat,
        ordinal: stage.ordinal,
      })),
    rounds: [...dto.rounds]
      .sort((left, right) => left.ordinal - right.ordinal)
      .map((round) => ({
        roundId: round.roundId,
        stageId: round.stageId,
        name: round.name,
        ordinal: round.ordinal,
      })),
  };
}

export function mapFixturePage(dto: FixtureListDto): FixturePage {
  return {
    total: dto.total,
    items: dto.items.map((item) => ({
      fixtureId: item.fixtureId,
      opponentId: item.opponentId,
      stageId: item.stageId,
      roundId: item.roundId,
      venueId: item.venueId,
      homeAway: item.homeAway,
      scheduledAt: item.scheduledAt,
      status: item.status,
      rescheduleCount: item.rescheduleCount,
      rescheduleReason: item.rescheduleReason,
      cancellationReason: item.cancellationReason,
    })),
  };
}

export function mapOpponentPage(dto: OpponentListDto): OpponentPage {
  return {
    total: dto.total,
    items: dto.items.map((item) => ({
      opponentId: item.opponentId,
      name: item.name,
      shortName: item.shortName,
      notes: item.notes,
      status: item.status,
    })),
  };
}
