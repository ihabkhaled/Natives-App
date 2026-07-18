import type { ComponentType } from 'react';

import type { AppIconName } from '@/packages/icons';
import type { AppPath } from '@/shared/config';
import type { I18nKey } from '@/shared/i18n';
import type { AppRouteDefinition } from '@/shared/types';
import type { StatusTone } from '@/shared/ui';

export interface GuardedRouteProps {
  readonly definition: AppRouteDefinition;
}

/** A routed screen component. Aliased so pure layers avoid importing React. */
export type ScreenComponent = ComponentType;

/** Copy and styling for a guard state rendered in place of a screen. */
interface GuardStatePresentation {
  readonly iconName: AppIconName;
  readonly tone: StatusTone;
  readonly titleKey: I18nKey;
  readonly messageKey: I18nKey;
  readonly testId: string;
}

/** Data-only mapping from a guard outcome to how it renders. */
export type GuardPresentation =
  | { readonly kind: 'loading' }
  | { readonly kind: 'allow' }
  | { readonly kind: 'redirect'; readonly redirectPath: AppPath }
  | { readonly kind: 'state'; readonly state: GuardStatePresentation };

/** Fully-resolved, translated render instruction consumed by GuardedRoute. */
export type GuardInstruction =
  | { readonly kind: 'loading'; readonly label: string }
  | { readonly kind: 'redirect'; readonly to: string }
  | {
      readonly kind: 'state';
      readonly icon: string;
      readonly tone: StatusTone;
      readonly title: string;
      readonly message: string;
      readonly testId: string;
    }
  | { readonly kind: 'screen'; readonly Screen: ScreenComponent };
