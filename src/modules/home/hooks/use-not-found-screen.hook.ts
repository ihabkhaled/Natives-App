import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { APP_PATHS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

export interface NotFoundScreenView {
  readonly title: string;
  readonly message: string;
  readonly goHomeLabel: string;
  readonly onGoHome: () => void;
}

export function useNotFoundScreen(): NotFoundScreenView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  return {
    title: t(I18N_KEYS.notFound.title),
    message: t(I18N_KEYS.notFound.message),
    goHomeLabel: t(I18N_KEYS.notFound.goHome),
    onGoHome: () => {
      navigation.replace(APP_PATHS.root);
    },
  };
}
