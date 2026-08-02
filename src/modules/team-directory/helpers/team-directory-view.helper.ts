import type { TranslateParams } from '@/packages/i18n';
import { SOCIAL_LINKS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import {
  STAFF_TITLE_I18N_KEYS,
  STAFF_TITLE_ORDER,
  TEAM_SOCIAL_LABEL_I18N_KEYS,
} from '../team-directory.constants';
import type {
  DirectoryCardView,
  DirectoryGroupView,
  TeamHeroView,
  TeamSocialLinkView,
} from '../types/team-directory-view.types';
import type { TeamDirectory, TeamProfile } from '../types/team-directory.types';
import { groupStaffByTitle } from './staff-groups.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** The person-shaped subset both a staff card and a roster card carry. */
interface CardSource {
  readonly id: string;
  readonly displayName: string;
  readonly nickname: string | null;
  readonly photoUrl: string | null;
  readonly jerseyNumber: string | null;
  readonly tags: readonly string[];
}

const KEYS = I18N_KEYS.teamDirectory;

/** One card, whether the portrait exists or the initials fallback takes over. */
function toCard(t: Translate, source: CardSource): DirectoryCardView {
  const jersey = source.jerseyNumber;
  return {
    id: source.id,
    displayName: source.displayName,
    nickname: source.nickname,
    photoUrl: source.photoUrl,
    portraitAlt: t(KEYS.portraitAlt, { name: source.displayName }),
    avatarLabel: t(KEYS.avatarLabel, { name: source.displayName }),
    jersey:
      jersey === null ? null : { text: jersey, label: t(KEYS.jerseyLabel, { number: jersey }) },
    tags: source.tags,
  };
}

function titleLabel(t: Translate, titleCode: string): string {
  return t(STAFF_TITLE_I18N_KEYS[titleCode] ?? KEYS.titleOther);
}

/**
 * The season board as titled card groups. A person holding several
 * responsibilities appears in each group and carries every title as a chip, so
 * the public page answers "who is responsible for what" in one pass.
 */
export function buildStaffGroupViews(
  t: Translate,
  directory: TeamDirectory | null,
): readonly DirectoryGroupView[] {
  return groupStaffByTitle(directory?.staff ?? [], STAFF_TITLE_ORDER).map((group) => ({
    key: group.titleCode,
    heading: titleLabel(t, group.titleCode),
    cards: group.members.map((member) =>
      toCard(t, {
        id: `${group.titleCode}-${member.id}`,
        displayName: member.displayName,
        nickname: member.nickname,
        photoUrl: member.photoUrl,
        jerseyNumber: null,
        tags: member.titles.map((title) => titleLabel(t, title)),
      }),
    ),
  }));
}

/** The active roster as jersey-badged cards, already ordered by the mapper. */
export function buildRosterCardViews(
  t: Translate,
  directory: TeamDirectory | null,
): readonly DirectoryCardView[] {
  return (directory?.players ?? []).map((player) =>
    toCard(t, {
      id: player.id,
      displayName: player.displayName,
      nickname: player.nickname,
      photoUrl: player.photoUrl,
      jerseyNumber: player.jerseyNumber,
      tags: player.position === null ? [] : [player.position],
    }),
  );
}

/** Only profiles the directory actually publishes are linked out of the hero. */
function buildSocialLinks(t: Translate, team: TeamProfile | null): readonly TeamSocialLinkView[] {
  const published = new Set(team?.socialUrls ?? []);
  return SOCIAL_LINKS.filter((social) => published.has(social.href)).map((social) => ({
    key: social.key,
    href: social.href,
    label: t(TEAM_SOCIAL_LABEL_I18N_KEYS[social.key]),
  }));
}

/**
 * The hero: translated framing plus the facts the directory publishes. Facts
 * with no value yet (while the directory is still loading) are dropped rather
 * than rendered as empty pills.
 */
export function buildTeamHeroView(t: Translate, directory: TeamDirectory | null): TeamHeroView {
  const team: TeamProfile | null = directory?.team ?? null;
  return {
    eyebrow: t(KEYS.heroEyebrow),
    title: t(KEYS.heroTitle),
    tagline: t(KEYS.heroTagline),
    facts: [
      {
        key: 'location',
        label: t(KEYS.factLocationLabel),
        value: team?.location ?? '',
        dateTime: null,
      },
      {
        key: 'founded',
        label: t(KEYS.factFoundedLabel),
        value: t(KEYS.factFoundedValue),
        dateTime: team?.foundedOn ?? null,
      },
      {
        key: 'sport',
        label: t(KEYS.factSportLabel),
        value: t(KEYS.factSportValue),
        dateTime: null,
      },
      {
        key: 'squad',
        label: t(KEYS.factSquadLabel),
        value: t(KEYS.factSquadValue),
        dateTime: null,
      },
    ].filter((fact) => fact.value !== ''),
    followHeading: t(KEYS.followHeading),
    socialLinks: buildSocialLinks(t, team),
  };
}
