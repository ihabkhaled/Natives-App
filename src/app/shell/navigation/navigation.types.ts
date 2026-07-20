import type { AppIconName } from '@/packages/icons';
import type { I18nKey } from '@/shared/i18n';
import type { NavGroup } from '@/shared/types';

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
  readonly group: NavGroup;
  readonly iconName: AppIconName;
  readonly labelKey: I18nKey;
}

/** Destinations bucketed into their sidebar section, in render order. */
export interface NavGroupDescriptor {
  readonly key: NavGroup;
  readonly items: readonly NavItemDescriptor[];
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

/** A translated sidebar section: a small label above its destinations. */
export interface PrimaryNavGroup {
  readonly key: NavGroup;
  readonly label: string;
  readonly items: readonly PrimaryNavItem[];
}

/** The signed-in identity pinned to the bottom of the persistent sidebar. */
interface NavProfile {
  readonly name: string;
  readonly label: string;
  readonly signOutLabel: string;
  readonly isSigningOut: boolean;
  readonly onSignOut: () => void;
}

export interface PrimaryNavigationView {
  readonly isVisible: boolean;
  readonly ariaLabel: string;
  readonly appName: string;
  readonly tagline: string;
  readonly logoLabel: string;
  readonly profile: NavProfile | null;
  readonly groups: readonly PrimaryNavGroup[];
}
