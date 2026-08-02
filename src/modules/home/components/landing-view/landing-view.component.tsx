import { TEST_IDS } from '@/shared/config';
import { AppButton, PageSeo, PageShell, SectionPanel } from '@/shared/ui';

import { LandingAboutPreview } from '../landing-about-preview';
import { LandingCompetitions } from '../landing-competitions';
import { LandingExplainer } from '../landing-explainer';
import { LandingHero } from '../landing-hero';
import { LandingNews } from '../landing-news';
import { LandingSectionMore } from '../landing-section-more';
import { LandingStaffDirectory } from '../landing-staff-directory';
import type { LandingViewProps } from './landing-view.types';

/**
 * The public landing page at `/` — a front door, not the whole site.
 *
 * Each subject has its own page (`/ultimate`, `/spirit`, `/team`, `/results`,
 * `/news`, `/gallery`, `/location`, `/achievements`); the sections here are
 * teasers that link through. Keeping the front door short is what lets every
 * subject carry its own title, description and canonical URL.
 */
export function LandingView(props: LandingViewProps): React.JSX.Element {
  return (
    <PageShell title={props.hero.title} testId={TEST_IDS.landingPage} immersive>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-landing-layout">
        <LandingHero view={props.hero} />

        <LandingExplainer view={props.explainer} />
        <LandingSectionMore view={props.explainerLink} sectionKey="ultimate" />

        <LandingAboutPreview view={props.aboutPreview} />

        <LandingStaffDirectory view={props.staffDirectory} />
        <LandingSectionMore view={props.staffLink} sectionKey="team" />

        <LandingCompetitions view={props.competitions} />
        <LandingSectionMore view={props.competitionsLink} sectionKey="results" />

        <LandingNews view={props.news} />
        <LandingSectionMore view={props.newsLink} sectionKey="news" />

        <SectionPanel
          heading={props.social.heading}
          intro={props.social.intro}
          testId={TEST_IDS.landingSocial}
        >
          <ul className="app-contact-social-list">
            {props.social.links.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-testid={`${TEST_IDS.landingSocialLink}-${link.key}`}
                  className="app-contact-social-link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </SectionPanel>

        <SectionPanel heading={props.finalCta.heading} testId={TEST_IDS.landingFinalCta}>
          <p className="m-0 text-base">{props.finalCta.body}</p>
          <div className="app-landing-hero__actions">
            <AppButton
              label={props.finalCta.primaryLabel}
              onClick={props.finalCta.onPrimaryClick}
              tone="primary"
              testId={TEST_IDS.landingFinalCtaPrimary}
            />
            <AppButton
              label={props.finalCta.secondaryLabel}
              onClick={props.finalCta.onSecondaryClick}
              tone="secondary"
              testId={TEST_IDS.landingFinalCtaSecondary}
            />
          </div>
        </SectionPanel>
      </div>
    </PageShell>
  );
}
