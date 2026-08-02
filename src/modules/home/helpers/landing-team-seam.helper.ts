import { STAFF_TITLE_I18N_KEYS, type TeamDirectory } from '@/modules/team-directory';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  buildLiveSeamChrome,
  type LandingSeamChrome,
  type LiveSeamState,
} from './landing-seam-copy.helper';

type Translate = (key: string, params?: TranslateParams) => string;

interface StaffCardView {
  readonly id: string;
  readonly name: string;
  readonly nickname: string;
  readonly titles: readonly string[];
  readonly avatarLabel: string;
  readonly photoUrl: string | null;
}

export interface StaffDirectorySectionView {
  readonly heading: string;
  readonly intro: string;
  readonly chrome: LandingSeamChrome;
  readonly members: readonly StaffCardView[];
}

/**
 * Leadership & staff — the same live `GET /public/teams/{slug}/directory`
 * read the `/team` page renders, so the landing teaser can never disagree
 * with the page it links to. Title codes translate through the shared
 * catalog; one the client has not learned yet falls back to the generic
 * "Team staff" label rather than vanishing.
 */
export function buildStaffDirectorySection(
  t: Translate,
  directory: TeamDirectory | null,
  seam: LiveSeamState,
): StaffDirectorySectionView {
  const members = (directory?.staff ?? []).map((member) => ({
    id: member.id,
    name: member.displayName,
    nickname: member.nickname ?? member.displayName,
    titles: member.titles.map((title) =>
      t(STAFF_TITLE_I18N_KEYS[title] ?? I18N_KEYS.teamDirectory.titleOther),
    ),
    avatarLabel: t(I18N_KEYS.landing.staffAvatarLabel, { name: member.displayName }),
    photoUrl: member.photoUrl,
  }));
  return {
    heading: t(I18N_KEYS.landing.staffHeading),
    intro: t(I18N_KEYS.landing.staffIntro),
    chrome: buildLiveSeamChrome(
      t,
      { ...seam, hasItems: members.length > 0 },
      I18N_KEYS.landing.staffEmptyTitle,
      I18N_KEYS.landing.staffEmptyMessage,
    ),
    members,
  };
}
