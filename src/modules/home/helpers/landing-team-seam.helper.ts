import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { LANDING_STAFF, type StaffTitle } from '../constants/landing-staff.constants';
import { buildLandingSeamChrome, type LandingSeamChrome } from './landing-seam-copy.helper';

type Translate = (key: string, params?: TranslateParams) => string;

const STAFF_TITLE_LABEL_KEYS: Record<StaffTitle, string> = {
  coach: I18N_KEYS.landing.staffTitleCoach,
  'co-coach': I18N_KEYS.landing.staffTitleCoCoach,
  'spirit-captain': I18N_KEYS.landing.staffTitleSpiritCaptain,
  finance: I18N_KEYS.landing.staffTitleFinance,
  'social-media': I18N_KEYS.landing.staffTitleSocialMedia,
  analysis: I18N_KEYS.landing.staffTitleAnalysis,
  technical: I18N_KEYS.landing.staffTitleTechnical,
};

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
 * Leadership & staff — real Season-Board 26-27 data (see the landing-site
 * spec), seeded here as a stub source ahead of the team-directory endpoint
 * (contract 1.8.0). Unlike the other seams below, this one already has real
 * content: only the *source* is a stub, never the copy shown to a visitor.
 */
export function buildStaffDirectorySection(t: Translate): StaffDirectorySectionView {
  const members = LANDING_STAFF.map((member) => ({
    id: member.id,
    name: member.name,
    nickname: member.nickname,
    titles: member.titles.map((title) => t(STAFF_TITLE_LABEL_KEYS[title])),
    avatarLabel: t(I18N_KEYS.landing.staffAvatarLabel, { name: member.name }),
    photoUrl: member.photoUrl,
  }));
  return {
    heading: t(I18N_KEYS.landing.staffHeading),
    intro: t(I18N_KEYS.landing.staffIntro),
    chrome: buildLandingSeamChrome(
      t,
      members.length > 0,
      I18N_KEYS.landing.staffEmptyTitle,
      I18N_KEYS.landing.staffEmptyMessage,
    ),
    members,
  };
}

export interface ActivePlayersSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly chrome: LandingSeamChrome;
}

/**
 * Active players — no roster endpoint yet and no seeded roster to show
 * honestly, so this seam always presents its designed "coming soon" empty
 * state rather than a fabricated player list.
 */
export function buildActivePlayersSection(t: Translate): ActivePlayersSectionView {
  return {
    heading: t(I18N_KEYS.landing.playersHeading),
    intro: t(I18N_KEYS.landing.playersIntro),
    chrome: buildLandingSeamChrome(
      t,
      false,
      I18N_KEYS.landing.playersEmptyTitle,
      I18N_KEYS.landing.playersEmptyMessage,
    ),
  };
}
