import { IonText } from '@/packages/ionic';

import type { PublicPageHeroProps } from './public-page-hero.types';

/**
 * Eyebrow, h1 and optional lede — the masthead every public marketing page
 * opens with. Extracted because the About, Contact, competitions showcase and
 * split subject pages each carried their own copy of it, and because the h1
 * belongs in exactly one place: a second one on a page is an accessibility
 * defect that is easy to introduce by copying markup.
 */
export function PublicPageHero(props: PublicPageHeroProps): React.JSX.Element {
  return (
    <header className={props.className ?? 'app-about-hero'}>
      <IonText>
        <p className="app-eyebrow m-0">{props.eyebrow}</p>
      </IonText>
      <IonText>
        <h1 className="m-0 text-3xl font-bold">{props.title}</h1>
      </IonText>
      {props.intro === undefined ? null : (
        <IonText color="medium">
          <p className="m-0 text-base">{props.intro}</p>
        </IonText>
      )}
    </header>
  );
}
