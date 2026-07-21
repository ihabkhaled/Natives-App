import type { SchemaOutput } from '@/packages/schema';

import type {
  roleMatrixResponseSchema,
  seasonResponseSchema,
  teamResponseSchema,
} from '../schemas/teams.schema';
import type { RoleMatrix, Season, Team } from '../types/teams.types';

type TeamDto = SchemaOutput<typeof teamResponseSchema>;
type SeasonDto = SchemaOutput<typeof seasonResponseSchema>;
type RoleMatrixDto = SchemaOutput<typeof roleMatrixResponseSchema>;

/** Wire team to the app's shape; audit columns the screens never show are dropped. */
export function mapTeam(dto: TeamDto): Team {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    locale: dto.locale,
    timezone: dto.timezone,
    primaryColor: dto.primaryColor,
    status: dto.status,
    updatedAtIso: dto.updatedAt,
    version: dto.version,
  };
}

export function mapSeason(dto: SeasonDto): Season {
  return {
    id: dto.id,
    teamId: dto.teamId,
    slug: dto.slug,
    name: dto.name,
    startsOn: dto.startsOn,
    endsOn: dto.endsOn,
    status: dto.status,
    version: dto.version,
  };
}

export function mapRoleMatrix(dto: RoleMatrixDto): RoleMatrix {
  return {
    policyVersion: dto.policyVersion,
    permissions: dto.permissions.map((entry) => ({
      key: entry.key,
      area: entry.area,
      description: entry.description,
    })),
    roles: dto.roles.map((role) => ({
      key: role.key,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions,
    })),
  };
}
