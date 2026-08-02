import { describe, expect, it } from 'vitest';

import { MOCK_TEAM_DIRECTORY } from '@/tests/msw/team-directory.fixture';

import { mapTeamDirectoryResponse } from '@/modules/team-directory';

import { buildStaffDirectorySection } from './landing-team-seam.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;

const directory = mapTeamDirectoryResponse(MOCK_TEAM_DIRECTORY);

const liveSeam = {
  isLoading: false,
  error: null,
  isOffline: false,
  onRetry: (): void => undefined,
};

describe('buildStaffDirectorySection', () => {
  it('renders the live season board, ready, with translated titles and labels', () => {
    const section = buildStaffDirectorySection(t, directory, liveSeam);

    expect(section.chrome.status).toBe('ready');
    expect(section.members).toHaveLength(directory.staff.length);
    const sherif = section.members.find((member) => member.name === 'Sherif Ashraf');
    expect(sherif?.titles).toEqual(['t:teamDirectory.titleCoach']);
    expect(sherif?.avatarLabel).toBe('t:landing.staffAvatarLabel:{"name":"Sherif Ashraf"}');
    expect(sherif?.photoUrl).toBe('/staff/sherif-ashraf.jpg');
  });

  it('labels an unknown title with the generic bucket instead of dropping it', () => {
    const section = buildStaffDirectorySection(t, directory, liveSeam);
    const mai = section.members.find((member) => member.name === 'Mai Ashraf');

    // "Logistics" is not in the catalog yet; the person still appears.
    expect(mai?.titles).toEqual(['t:teamDirectory.titleOther']);
    // No nickname either — the display name stands in rather than a blank.
    expect(mai?.nickname).toBe('Mai Ashraf');
  });

  it('reports loading while the directory query is in flight', () => {
    const section = buildStaffDirectorySection(t, null, { ...liveSeam, isLoading: true });

    expect(section.chrome.status).toBe('loading');
    expect(section.members).toHaveLength(0);
  });

  it('shows the empty state when the query resolves without a season board', () => {
    const section = buildStaffDirectorySection(t, { ...directory, staff: [] }, liveSeam);

    expect(section.chrome.status).toBe('empty');
  });
});
