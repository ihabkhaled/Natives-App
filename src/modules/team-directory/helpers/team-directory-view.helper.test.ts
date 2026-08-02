import { describe, expect, it } from 'vitest';

import type { TranslateParams } from '@/packages/i18n';

import type {
  TeamDirectory,
  TeamProfile,
  TeamRosterPlayer,
  TeamStaffMember,
} from '../types/team-directory.types';
import {
  buildRosterCardViews,
  buildStaffGroupViews,
  buildTeamHeroView,
} from './team-directory-view.helper';

/** Echoes the key plus any interpolation, so assertions read as contracts. */
function translate(key: string, params?: TranslateParams): string {
  return params === undefined ? key : `${key}(${JSON.stringify(params)})`;
}

function member(overrides: Partial<TeamStaffMember> = {}): TeamStaffMember {
  return {
    id: 'staff-1',
    displayName: 'Sherif Ashraf',
    nickname: '3alamy',
    titles: ['coach'],
    photoUrl: null,
    ...overrides,
  };
}

function player(overrides: Partial<TeamRosterPlayer> = {}): TeamRosterPlayer {
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

const TEAM: TeamProfile = {
  slug: 'ultimate-natives',
  name: 'Ultimate Natives',
  location: 'El Sheikh Zayed, Giza, Egypt',
  foundedOn: '2021-10',
  socialUrls: ['https://www.facebook.com/ultimatenatives'],
};

function directory(overrides: Partial<TeamDirectory> = {}): TeamDirectory {
  return { team: TEAM, staff: [], players: [], ...overrides };
}

function staffOf(...members: readonly TeamStaffMember[]): TeamDirectory {
  return directory({ staff: members });
}

function rosterOf(...players: readonly TeamRosterPlayer[]): TeamDirectory {
  return directory({ players });
}

describe('buildStaffGroupViews', () => {
  it('translates each group heading from its title code', () => {
    const groups = buildStaffGroupViews(translate, staffOf(member()));

    expect(groups[0]?.heading).toBe('teamDirectory.titleCoach');
  });

  it('falls back to the generic staff heading for an unknown title code', () => {
    const groups = buildStaffGroupViews(translate, staffOf(member({ titles: ['logistics'] })));

    expect(groups[0]?.heading).toBe('teamDirectory.titleOther');
  });

  it('carries every responsibility a person holds as a chip', () => {
    const groups = buildStaffGroupViews(
      translate,
      staffOf(member({ titles: ['analysis', 'technical', 'co-coach'] })),
    );

    expect(groups[0]?.cards[0]?.tags).toEqual([
      'teamDirectory.titleAnalysis',
      'teamDirectory.titleTechnical',
      'teamDirectory.titleCoCoach',
    ]);
  });

  it('keys a card per group so one person in two groups stays unique', () => {
    const groups = buildStaffGroupViews(
      translate,
      staffOf(member({ id: 'hobz', titles: ['analysis', 'technical'] })),
    );
    const ids = groups.flatMap((group) => group.cards.map((card) => card.id));

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never puts a jersey badge on a staff card', () => {
    expect(buildStaffGroupViews(translate, staffOf(member()))[0]?.cards[0]?.jersey).toBeNull();
  });

  it('interpolates the person name into the avatar and portrait labels', () => {
    const card = buildStaffGroupViews(translate, staffOf(member()))[0]?.cards[0];

    expect(card?.avatarLabel).toBe('teamDirectory.avatarLabel({"name":"Sherif Ashraf"})');
    expect(card?.portraitAlt).toBe('teamDirectory.portraitAlt({"name":"Sherif Ashraf"})');
  });

  it('renders no group at all while the directory has not loaded', () => {
    expect(buildStaffGroupViews(translate, null)).toEqual([]);
  });
});

describe('buildRosterCardViews', () => {
  it('renders the jersey number as its own badge with an assistive label', () => {
    const cards = buildRosterCardViews(translate, rosterOf(player()));

    expect(cards[0]?.jersey).toEqual({
      text: '11',
      label: 'teamDirectory.jerseyLabel({"number":"11"})',
    });
  });

  it('omits the badge when the player has no jersey number yet', () => {
    expect(
      buildRosterCardViews(translate, rosterOf(player({ jerseyNumber: null })))[0]?.jersey,
    ).toBeNull();
  });

  it('shows the position as the only chip when the directory publishes one', () => {
    expect(buildRosterCardViews(translate, rosterOf(player()))[0]?.tags).toEqual(['Handler']);
  });

  it('shows no chips when the position is unknown', () => {
    expect(buildRosterCardViews(translate, rosterOf(player({ position: null })))[0]?.tags).toEqual(
      [],
    );
  });

  it('passes a published portrait through untouched', () => {
    const cards = buildRosterCardViews(translate, rosterOf(player({ photoUrl: '/staff/roo.jpg' })));

    expect(cards[0]?.photoUrl).toBe('/staff/roo.jpg');
  });

  it('renders no card at all while the directory has not loaded', () => {
    expect(buildRosterCardViews(translate, null)).toEqual([]);
  });
});

describe('buildTeamHeroView', () => {
  it('lists the published facts, with the founding date machine-readable', () => {
    const hero = buildTeamHeroView(translate, directory());

    expect(hero.facts.map((fact) => fact.key)).toEqual(['location', 'founded', 'sport', 'squad']);
    expect(hero.facts.find((fact) => fact.key === 'founded')?.dateTime).toBe('2021-10');
    expect(hero.facts.find((fact) => fact.key === 'location')?.value).toBe(
      'El Sheikh Zayed, Giza, Egypt',
    );
  });

  it('drops the location pill while the directory has not loaded', () => {
    const hero = buildTeamHeroView(translate, null);

    expect(hero.facts.map((fact) => fact.key)).toEqual(['founded', 'sport', 'squad']);
    expect(hero.facts.find((fact) => fact.key === 'founded')?.dateTime).toBeNull();
  });

  it('links only the profiles the directory actually publishes', () => {
    const hero = buildTeamHeroView(translate, directory());

    expect(hero.socialLinks).toEqual([
      {
        key: 'facebook',
        href: 'https://www.facebook.com/ultimatenatives',
        label: 'publicFooter.facebookLabel',
      },
    ]);
  });

  it('links nothing while the directory has not loaded', () => {
    expect(buildTeamHeroView(translate, null).socialLinks).toEqual([]);
  });

  it('translates its framing copy', () => {
    const hero = buildTeamHeroView(translate, directory());

    expect(hero.eyebrow).toBe('teamDirectory.heroEyebrow');
    expect(hero.title).toBe('teamDirectory.heroTitle');
    expect(hero.tagline).toBe('teamDirectory.heroTagline');
    expect(hero.followHeading).toBe('teamDirectory.followHeading');
  });
});
