import { IonIcon } from '@/packages/ionic';
import { AvatarFallback, BrandLogo } from '@/shared/ui';

import { PRIMARY_NAV_TEST_ID } from './primary-navigation.constants';
import type { PrimaryNavigationProps } from './primary-navigation.types';

/**
 * Responsive primary navigation: a bottom tab bar on compact viewports and a
 * side rail on wider ones (driven by CSS). UI-only — every item arrives
 * translated with its active state and handler already prepared.
 */
export function PrimaryNavigation(props: PrimaryNavigationProps): React.JSX.Element | null {
  return props.isVisible ? (
    <nav aria-label={props.ariaLabel} data-testid={PRIMARY_NAV_TEST_ID} className="app-primary-nav">
      <div className="app-primary-nav__brand">
        <BrandLogo label={props.logoLabel} size="sm" />
        <span>{props.appName}</span>
      </div>
      {props.profile === null ? null : (
        <div className="app-primary-nav__profile">
          <AvatarFallback name={props.profile.name} label={props.profile.label} size="md" />
          <span className="app-primary-nav__profile-name">{props.profile.name}</span>
        </div>
      )}
      {props.items.map((item) => (
        <button
          key={item.key}
          type="button"
          data-testid={item.testId}
          className="app-primary-nav__item"
          aria-current={item.isActive ? 'page' : undefined}
          onClick={item.onSelect}
        >
          <IonIcon icon={item.icon} aria-hidden="true" className="app-primary-nav__icon" />
          <span className="app-primary-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  ) : null;
}
