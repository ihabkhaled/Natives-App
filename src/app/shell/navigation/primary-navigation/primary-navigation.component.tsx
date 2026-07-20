import { APP_ICONS } from '@/packages/icons';
import { IonIcon } from '@/packages/ionic';
import { AvatarFallback, BrandLogo } from '@/shared/ui';

import { PRIMARY_NAV_SIGN_OUT_TEST_ID, PRIMARY_NAV_TEST_ID } from './primary-navigation.constants';
import type { PrimaryNavigationProps } from './primary-navigation.types';

/**
 * Responsive primary navigation: a bottom tab bar on compact viewports and a
 * persistent sidebar on wider ones (driven by CSS — the markup is rendered
 * once so every destination has exactly one node). The sidebar caps with the
 * brand block, groups destinations under small section labels, marks the
 * active one with the lime disc-flight arc, and pins the signed-in identity
 * with its sign-out to the bottom. UI-only: every item arrives translated with
 * its active state and handler already prepared.
 */
export function PrimaryNavigation(props: PrimaryNavigationProps): React.JSX.Element | null {
  return props.isVisible ? (
    <nav aria-label={props.ariaLabel} data-testid={PRIMARY_NAV_TEST_ID} className="app-primary-nav">
      <div className="app-primary-nav__brand">
        <BrandLogo label={props.logoLabel} size="sm" />
        <span className="app-primary-nav__brand-text">
          <span className="app-primary-nav__brand-name">{props.appName}</span>
          <span className="app-primary-nav__brand-tagline">{props.tagline}</span>
        </span>
      </div>
      <div className="app-primary-nav__rail">
        {props.groups.map((group) => (
          <div key={group.key} className="app-primary-nav__group">
            <p className="app-primary-nav__group-label">{group.label}</p>
            {group.items.map((item) => (
              <button
                key={item.key}
                type="button"
                data-testid={item.testId}
                className="app-primary-nav__item"
                aria-current={item.isActive ? 'page' : undefined}
                onClick={item.onSelect}
              >
                <span className="app-primary-nav__arc" aria-hidden="true" />
                <IonIcon icon={item.icon} aria-hidden="true" className="app-primary-nav__icon" />
                <span className="app-primary-nav__label">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {props.profile === null ? null : (
        <div className="app-primary-nav__profile">
          <AvatarFallback name={props.profile.name} label={props.profile.label} size="sm" />
          <span className="app-primary-nav__profile-name">{props.profile.name}</span>
          <button
            type="button"
            data-testid={PRIMARY_NAV_SIGN_OUT_TEST_ID}
            className="app-primary-nav__sign-out"
            aria-label={props.profile.signOutLabel}
            aria-busy={props.profile.isSigningOut ? 'true' : undefined}
            onClick={props.profile.onSignOut}
          >
            <IonIcon icon={APP_ICONS.logOut} aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  ) : null;
}
