import { describe, expect, it } from 'vitest';

import type {
  TeamDirectoryResponseDto,
  TeamPlayerDto,
  TeamStaffMemberDto,
} from '../types/team-directory.types';
import { mapTeamDirectoryResponse } from './team-directory.mapper';

function staff(overrides: Partial<TeamStaffMemberDto> = {}): TeamStaffMemberDto {
  return {
    id: 'staff-1',
    displayName: 'Sherif Ashraf',
    nickname: '3alamy',
    titles: ['coach'],
    photoUrl: null,
    ...overrides,
  };
}

function player(overrides: Partial<TeamPlayerDto> = {}): TeamPlayerDto {
  return {
    id: 'player-1',
    displayName: 'Rawan Elessawy',
    nickname: 'Roo',
    jerseyNumber: '11',
    position: 'Handler',
    photoUrl: null,
    ...overrides,
  };
}

function response(overrides: Partial<TeamDirectoryResponseDto> = {}): TeamDirectoryResponseDto {
  return {
    team: {
      slug: ' ultimate-natives ',
      name: ' Ultimate Natives ',
      location: ' El Sheikh Zayed, Giza, Egypt ',
      foundedOn: ' 2021-10 ',
      socialUrls: ['https://www.facebook.com/ultimatenatives', 'http://insecure.example.com'],
    },
    staff: [staff()],
    players: [player()],
    ...overrides,
  };
}

describe('mapTeamDirectoryResponse', () => {
  it('trims every field of the team profile', () => {
    expect(mapTeamDirectoryResponse(response()).team).toMatchObject({
      slug: 'ultimate-natives',
      name: 'Ultimate Natives',
      location: 'El Sheikh Zayed, Giza, Egypt',
      foundedOn: '2021-10',
    });
  });

  it('drops any social profile that is not served over https', () => {
    expect(mapTeamDirectoryResponse(response()).team.socialUrls).toEqual([
      'https://www.facebook.com/ultimatenatives',
    ]);
  });

  it('lower-cases and trims title codes so grouping is stable', () => {
    const mapped = mapTeamDirectoryResponse(
      response({ staff: [staff({ titles: [' CO-COACH ', 'Analysis'] })] }),
    );

    expect(mapped.staff[0]?.titles).toEqual(['co-coach', 'analysis']);
  });

  it('drops blank title codes rather than rendering an empty chip', () => {
    const mapped = mapTeamDirectoryResponse(
      response({ staff: [staff({ titles: ['coach', '   '] })] }),
    );

    expect(mapped.staff[0]?.titles).toEqual(['coach']);
  });

  it('collapses a blank nickname or photo into null so the fallback triggers', () => {
    const mapped = mapTeamDirectoryResponse(
      response({
        staff: [staff({ nickname: '  ', photoUrl: '  ' })],
        players: [player({ nickname: null, photoUrl: null, position: '  ' })],
      }),
    );

    expect(mapped.staff[0]).toMatchObject({ nickname: null, photoUrl: null });
    expect(mapped.players[0]).toMatchObject({ nickname: null, photoUrl: null, position: null });
  });

  it('keeps a real portrait url untouched', () => {
    const mapped = mapTeamDirectoryResponse(
      response({ staff: [staff({ photoUrl: '/staff/3alamy.jpg' })] }),
    );

    expect(mapped.staff[0]?.photoUrl).toBe('/staff/3alamy.jpg');
  });

  it('orders the roster by jersey number, ascending', () => {
    const mapped = mapTeamDirectoryResponse(
      response({
        players: [
          player({ id: 'p-33', jerseyNumber: '33' }),
          player({ id: 'p-2', jerseyNumber: '2' }),
          player({ id: 'p-11', jerseyNumber: '11' }),
        ],
      }),
    );

    expect(mapped.players.map((entry) => entry.id)).toEqual(['p-2', 'p-11', 'p-33']);
  });

  it('places players without a jersey last, sorted by name', () => {
    const mapped = mapTeamDirectoryResponse(
      response({
        players: [
          player({ id: 'p-zahra', displayName: 'Zahra', jerseyNumber: null }),
          player({ id: 'p-abdel', displayName: 'Abdelrahman Elleimy', jerseyNumber: null }),
          player({ id: 'p-11', jerseyNumber: '11' }),
        ],
      }),
    );

    expect(mapped.players.map((entry) => entry.id)).toEqual(['p-11', 'p-abdel', 'p-zahra']);
  });

  it('never mutates the response it was given', () => {
    const dto = response({
      players: [player({ id: 'p-33', jerseyNumber: '33' }), player({ id: 'p-2', jerseyNumber: '2' })],
    });

    mapTeamDirectoryResponse(dto);

    expect(dto.players.map((entry) => entry.id)).toEqual(['p-33', 'p-2']);
  });
});
