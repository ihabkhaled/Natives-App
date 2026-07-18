import { APP_ICONS } from '@/packages/icons';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

import type { GuardInstruction, GuardPresentation, ScreenComponent } from './guarded-route.types';

/** Resolve a data-only presentation into a translated render instruction. */
export function toGuardInstruction(
  presentation: GuardPresentation,
  screen: ScreenComponent,
  translate: (key: I18nKey) => string,
): GuardInstruction {
  if (presentation.kind === 'loading') {
    return { kind: 'loading', label: translate(I18N_KEYS.common.loading) };
  }
  if (presentation.kind === 'redirect') {
    return { kind: 'redirect', to: presentation.redirectPath };
  }
  if (presentation.kind === 'state') {
    return {
      kind: 'state',
      icon: APP_ICONS[presentation.state.iconName],
      tone: presentation.state.tone,
      title: translate(presentation.state.titleKey),
      message: translate(presentation.state.messageKey),
      testId: presentation.state.testId,
    };
  }
  return { kind: 'screen', Screen: screen };
}
