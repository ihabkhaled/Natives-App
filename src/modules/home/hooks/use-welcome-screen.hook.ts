import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { APP_PATHS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

export interface WelcomeScreenView {
  readonly title: string;
  readonly subtitle: string;
  readonly loginCta: string;
  readonly onLoginClick: () => void;
}

export function useWelcomeScreen(): WelcomeScreenView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  return {
    title: t(I18N_KEYS.welcome.title),
    subtitle: t(I18N_KEYS.welcome.subtitle),
    loginCta: t(I18N_KEYS.welcome.loginCta),
    onLoginClick: () => {
      navigation.push(APP_PATHS.login);
    },
  };
}
