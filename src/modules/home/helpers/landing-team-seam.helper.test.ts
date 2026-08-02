import { describe, expect, it } from 'vitest';

import { buildActivePlayersSection, buildStaffDirectorySection } from './landing-team-seam.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;

describe('buildStaffDirectorySection', () => {
  it('seeds all nine Season-Board members, ready, with translated titles and avatar labels', () => {
    const section = buildStaffDirectorySection(t);

    expect(section.chrome.status).toBe('ready');
    expect(section.members).toHaveLength(9);
    const sherif = section.members.find((member) => member.id === 'sherif-ashraf');
    expect(sherif?.titles).toEqual(['t:landing.staffTitleCoach']);
    expect(sherif?.avatarLabel).toBe('t:landing.staffAvatarLabel:{"name":"Sherif Ashraf"}');
    expect(sherif?.photoUrl).toBe('/staff/sherif-ashraf.jpg');
  });

  it('gives every staff title a translated label', () => {
    const section = buildStaffDirectorySection(t);
    const ihab = section.members.find((member) => member.id === 'ihab-khaled');

    expect(ihab?.titles).toEqual(['t:landing.staffTitleAnalysis', 't:landing.staffTitleTechnical']);
  });
});

describe('buildActivePlayersSection', () => {
  it('presents the honest empty state — no active roster is seeded', () => {
    const section = buildActivePlayersSection(t);

    expect(section.chrome.status).toBe('empty');
    expect(section.heading).toBe('t:landing.playersHeading');
  });
});
