import { useSession } from '@/modules/auth';
import { tryoutRegistrationPath } from '@/modules/tryouts';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { APP_PATHS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { resolvePublicShellVisibility } from '../public-shell-visibility.helper';
import { PUBLIC_SOCIAL_LINKS, SOCIAL_LABEL_I18N_KEYS } from './public-footer.constants';
import type { PublicFooterView } from './public-footer.types';

/**
 * Prepared view model for the signed-out marketing footer. Shares the same
 * anonymous-only visibility rule as the public navbar.
 */
export function usePublicFooter(): PublicFooterView {
  const session = useSession();
  const navigation = useAppNavigation();
  const { t } = useAppTranslation();

  return {
    isVisible: resolvePublicShellVisibility(session),
    ariaLabel: t(I18N_KEYS.publicFooter.label),
    brandName: t(I18N_KEYS.common.appName),
    tagline: t(I18N_KEYS.publicFooter.tagline),
    navHeading: t(I18N_KEYS.publicFooter.navHeading),
    links: [
      { key: 'home', label: t(I18N_KEYS.publicNav.home), path: APP_PATHS.root },
      { key: 'about', label: t(I18N_KEYS.publicNav.about), path: APP_PATHS.about },
      {
        key: 'tryouts',
        label: t(I18N_KEYS.publicNav.tryouts),
        path: tryoutRegistrationPath(),
      },
      { key: 'contact', label: t(I18N_KEYS.publicNav.contact), path: APP_PATHS.contact },
    ],
    onNavigate: navigation.push,
    socialHeading: t(I18N_KEYS.publicFooter.socialHeading),
    socialLinks: PUBLIC_SOCIAL_LINKS.map((social) => ({
      key: social.key,
      href: social.href,
      icon: social.icon,
      label: t(SOCIAL_LABEL_I18N_KEYS[social.key]),
    })),
    copyright: t(I18N_KEYS.publicFooter.copyright, { year: new Date().getFullYear() }),
  };
}
