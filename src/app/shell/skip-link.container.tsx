import { useAppTranslation } from '@/packages/i18n';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

/**
 * Keyboard skip link: the first focusable element, visually hidden until
 * focused, jumping straight to the main-content landmark.
 */
export function SkipLink(): React.JSX.Element {
  const { t } = useAppTranslation();
  return (
    <a className="app-skip-link" href={`#${TEST_IDS.mainContent}`} data-testid={TEST_IDS.skipLink}>
      {t(I18N_KEYS.nav.skipToContent)}
    </a>
  );
}
