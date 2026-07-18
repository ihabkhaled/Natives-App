import type { AppIconName } from '@/packages/icons';
import type { I18nKey } from '@/shared/i18n';

/** The effective session facts that decide which destinations are shown. */
export interface NavVisibilityContext {
  readonly permissions: readonly string[];
  readonly hasTeamContext: boolean;
}

/** A navigation destination that survived permission and context filtering. */
export interface NavItemDescriptor {
  readonly path: string;
  readonly key: string;
  readonly order: number;
  readonly iconName: AppIconName;
  readonly labelKey: I18nKey;
}

/** A prepared, translated navigation item ready for the presentational bar. */
export interface PrimaryNavItem {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly testId: string;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}

export interface PrimaryNavigationView {
  readonly isVisible: boolean;
  readonly ariaLabel: string;
  readonly appName: string;
  readonly logoLabel: string;
  readonly items: readonly PrimaryNavItem[];
}
