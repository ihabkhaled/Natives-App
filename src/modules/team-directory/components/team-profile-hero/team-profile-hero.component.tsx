import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { TeamProfileHeroProps } from './team-profile-hero.types';

/** The `/team` masthead: framing copy, the disc-flight arc, facts, socials. */
export function TeamProfileHero(props: TeamProfileHeroProps): React.JSX.Element {
  const hero = props.hero;
  return (
    <header className="app-team-hero" data-testid={TEST_IDS.teamDirectoryHero}>
      <span className="app-team-hero__arc" aria-hidden="true" />
      <div className="app-team-hero__content">
        <IonText>
          <p className="app-eyebrow m-0">{hero.eyebrow}</p>
        </IonText>
        <IonText>
          <h1 className="app-team-hero__title m-0">{hero.title}</h1>
        </IonText>
        <IonText color="medium">
          <p className="app-team-hero__tagline m-0">{hero.tagline}</p>
        </IonText>
        <dl className="app-team-hero__facts">
          {hero.facts.map((fact) => (
            <div key={fact.key} className="app-team-fact">
              <dt className="app-team-fact__label">{fact.label}</dt>
              <dd className="app-team-fact__value m-0">
                {fact.dateTime === null ? (
                  fact.value
                ) : (
                  <time dateTime={fact.dateTime}>{fact.value}</time>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {hero.socialLinks.length === 0 ? null : (
          <nav className="app-team-hero__social" aria-label={hero.followHeading}>
            {hero.socialLinks.map((social) => (
              <a
                key={social.key}
                className="app-team-social-link"
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {social.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
