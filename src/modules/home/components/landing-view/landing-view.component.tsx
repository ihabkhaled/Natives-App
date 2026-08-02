import { TEST_IDS } from '@/shared/config';
import { AppButton, FactList, PageSeo, PageShell, SectionPanel } from '@/shared/ui';

import { LandingAboutPreview } from '../landing-about-preview';
import { LandingActivePlayers } from '../landing-active-players';
import { LandingCompetitions } from '../landing-competitions';
import { LandingExplainer } from '../landing-explainer';
import { LandingGallery } from '../landing-gallery';
import { LandingHero } from '../landing-hero';
import { LandingLeaderboard } from '../landing-leaderboard';
import { LandingLocation } from '../landing-location';
import { LandingMatchScores } from '../landing-match-scores';
import { LandingNews } from '../landing-news';
import { LandingStaffDirectory } from '../landing-staff-directory';
import { SpiritValuesGrid } from '../spirit-values-grid';
import type { LandingViewProps } from './landing-view.types';

/** The public marketing landing page at `/`: the team's full front door. */
export function LandingView(props: LandingViewProps): React.JSX.Element {
  return (
    <PageShell title={props.hero.title} testId={TEST_IDS.landingPage} immersive>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-landing-layout">
        <LandingHero view={props.hero} />
        <LandingExplainer view={props.explainer} />
        <LandingAboutPreview view={props.aboutPreview} />
        <LandingStaffDirectory view={props.staffDirectory} />
        <LandingActivePlayers view={props.activePlayers} />
        <LandingCompetitions view={props.competitions} />
        <LandingMatchScores view={props.matchScores} />
        <LandingLeaderboard view={props.leaderboard} />
        <LandingNews view={props.news} />
        <SpiritValuesGrid
          heading={props.spiritValues.heading}
          intro={props.spiritValues.intro}
          values={props.spiritValues.values}
          cardTestIdPrefix={TEST_IDS.spiritValueCard}
          sectionTestId={TEST_IDS.landingSpiritValues}
        />
        <LandingLocation view={props.location} />
        <LandingGallery view={props.gallery} />

        <SectionPanel heading={props.achievements.heading} testId={TEST_IDS.landingAchievements}>
          <FactList
            items={props.achievements.items}
            ariaLabel={props.achievements.heading}
            testId={TEST_IDS.landingAchievements}
          />
        </SectionPanel>

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
