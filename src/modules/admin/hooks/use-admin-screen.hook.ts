import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

export interface AdminScreenView {
  readonly title: string;
  readonly heading: string;
  readonly description: string;
}

/** Prepared, translated view model for the admin console screen. */
export function useAdminScreen(): AdminScreenView {
  const { t } = useAppTranslation();
  return {
    title: t(I18N_KEYS.admin.title),
    heading: t(I18N_KEYS.admin.heading),
    description: t(I18N_KEYS.admin.description),
  };
}
