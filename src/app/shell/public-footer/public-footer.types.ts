import type { AppIcon } from '@/packages/icons';

/** One footer navigation link. */
interface PublicFooterLink {
  readonly key: string;
  readonly label: string;
  readonly path: string;
}

/** One social platform link, opened in a new tab. */
interface PublicFooterSocialLink {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  readonly icon: AppIcon;
}

/** Prepared, translated view model for the signed-out marketing footer. */
export interface PublicFooterView {
  readonly isVisible: boolean;
  readonly ariaLabel: string;
  readonly brandName: string;
  readonly tagline: string;
  readonly navHeading: string;
  readonly links: readonly PublicFooterLink[];
  readonly onNavigate: (path: string) => void;
  readonly socialHeading: string;
  readonly socialLinks: readonly PublicFooterSocialLink[];
  readonly copyright: string;
}
