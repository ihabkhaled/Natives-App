import { APP_ICONS } from '@/packages/icons';
import { IonIcon } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, BrandLogo } from '@/shared/ui';

import type { PublicNavProps } from './public-nav.types';

/**
 * The signed-out marketing navbar: brand mark, primary links, language and
 * theme switches, and a sign-in call to action. A horizontal bar on desktop;
 * on compact viewports the links collapse behind a hamburger that opens a
 * drawer carrying the same destinations and switches (CSS reshapes one
 * markup tree instead of duplicating it, except for the drawer overlay which
 * only exists while open). UI-only: every label, flag, and handler arrives
 * prepared.
 */
export function PublicNav(props: PublicNavProps): React.JSX.Element | null {
  return props.isVisible ? (
    <header className="app-bar app-public-nav" data-testid={TEST_IDS.publicNav}>
      <button
        type="button"
        className="app-public-nav__brand"
        data-testid={TEST_IDS.publicNavBrand}
        onClick={() => {
          props.onNavigate(props.homePath);
        }}
      >
        <BrandLogo label={props.logoLabel} size="sm" />
        <span className="app-public-nav__brand-text">
          <span className="app-public-nav__brand-name">{props.brandName}</span>
          <span className="app-public-nav__brand-tagline">{props.brandTagline}</span>
        </span>
      </button>
      <nav aria-label={props.ariaLabel} className="app-public-nav__links">
        {props.links.map((link) => (
          <button
            key={link.key}
            type="button"
            data-testid={`${TEST_IDS.publicNavLink}-${link.key}`}
            className="app-public-nav__link"
            aria-current={link.isActive ? 'page' : undefined}
            onClick={() => {
              props.onNavigate(link.path);
            }}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="app-public-nav__actions">
        <button
          type="button"
          className="app-bar__icon-button"
          data-testid={TEST_IDS.publicNavLocaleToggle}
          aria-label={props.localeToggleLabel}
          aria-pressed={props.isArabic}
          onClick={props.onToggleLocale}
        >
          <IonIcon icon={APP_ICONS.globe} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="app-bar__icon-button"
          data-testid={TEST_IDS.publicNavThemeToggle}
          aria-label={props.themeToggleLabel}
          aria-pressed={props.isDark}
          onClick={props.onToggleTheme}
        >
          <IonIcon icon={props.isDark ? APP_ICONS.sun : APP_ICONS.moon} aria-hidden="true" />
        </button>
        <span className="app-public-nav__sign-in">
          <AppButton
            label={props.signInLabel}
            tone="primary"
            onClick={props.onSignIn}
            testId={TEST_IDS.publicNavSignIn}
          />
        </span>
        <button
          type="button"
          className="app-public-nav__menu-button"
          data-testid={TEST_IDS.publicNavMenuButton}
          aria-label={props.menuToggleLabel}
          aria-expanded={props.isMenuOpen}
          aria-haspopup="dialog"
          onClick={props.onToggleMenu}
        >
          <IonIcon icon={props.isMenuOpen ? APP_ICONS.close : APP_ICONS.menu} aria-hidden="true" />
        </button>
      </div>
      {props.isMenuOpen ? (
        <div
          className="app-public-nav__drawer"
          role="dialog"
          aria-modal="true"
          aria-label={props.ariaLabel}
          data-testid={TEST_IDS.publicNavDrawer}
        >
          <nav aria-label={props.ariaLabel} className="app-public-nav__drawer-links">
            {props.links.map((link) => (
              <button
                key={link.key}
                type="button"
                data-testid={`${TEST_IDS.publicNavLink}-drawer-${link.key}`}
                className="app-public-nav__link"
                aria-current={link.isActive ? 'page' : undefined}
                onClick={() => {
                  props.onNavigate(link.path);
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <AppButton
            label={props.signInLabel}
            tone="primary"
            expand
            onClick={props.onSignIn}
            testId={TEST_IDS.publicNavSignInDrawer}
          />
        </div>
      ) : null}
    </header>
  ) : null;
}
