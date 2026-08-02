import { I18N_KEYS } from '@/shared/i18n';
import { SOCIAL_LINKS } from '@/shared/config';

type Translate = (key: string) => string;
type SocialKey = (typeof SOCIAL_LINKS)[number]['key'];

const SOCIAL_LABEL_KEYS: Record<SocialKey, string> = {
  facebook: I18N_KEYS.publicFooter.facebookLabel,
  instagram: I18N_KEYS.publicFooter.instagramLabel,
  tiktok: I18N_KEYS.publicFooter.tiktokLabel,
};

export interface SocialLinkView {
  readonly key: string;
  readonly href: string;
  readonly label: string;
}

export interface SocialSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly links: readonly SocialLinkView[];
}

/** The team's real, confirmed social profiles — the same list the footer decorates. */
export function buildSocialSection(t: Translate): SocialSectionView {
  return {
    heading: t(I18N_KEYS.landing.socialHeading),
    intro: t(I18N_KEYS.landing.socialIntro),
    links: SOCIAL_LINKS.map((social) => ({
      key: social.key,
      href: social.href,
      label: t(SOCIAL_LABEL_KEYS[social.key]),
    })),
  };
}
