import { IonIcon } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { PublicFooterProps } from './public-footer.types';

/**
 * The signed-out marketing footer: brand, secondary navigation, and the real
 * social links, wrapping to a stacked layout on narrow viewports. UI-only:
 * every label and handler arrives prepared.
 */
export function PublicFooter(props: PublicFooterProps): React.JSX.Element | null {
  return props.isVisible ? (
    <footer
      className="app-public-footer"
      aria-label={props.ariaLabel}
      data-testid={TEST_IDS.publicFooter}
    >
      <div className="app-public-footer__brand">
        <p className="app-public-footer__brand-name">{props.brandName}</p>
        <p className="app-public-footer__tagline">{props.tagline}</p>
      </div>
      <nav aria-label={props.navHeading} className="app-public-footer__nav">
        <p className="app-public-footer__heading">{props.navHeading}</p>
        {props.links.map((link) => (
          <button
            key={link.key}
            type="button"
            data-testid={`${TEST_IDS.publicFooterLink}-${link.key}`}
            className="app-public-footer__link"
            onClick={() => {
              props.onNavigate(link.path);
            }}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="app-public-footer__social">
        <p className="app-public-footer__heading">{props.socialHeading}</p>
        <div className="app-public-footer__social-row">
          {props.socialLinks.map((social) => (
            <a
              key={social.key}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={social.label}
              data-testid={`${TEST_IDS.publicFooterSocialLink}-${social.key}`}
              className="app-public-footer__social-link"
            >
              <IonIcon icon={social.icon} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <p className="app-public-footer__copyright">{props.copyright}</p>
    </footer>
  ) : null;
}
