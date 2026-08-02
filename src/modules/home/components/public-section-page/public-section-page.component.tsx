import { IonText } from '@/packages/ionic';
import { PageSeo, PageShell } from '@/shared/ui';

import type { PublicSectionPageProps } from './public-section-page.types';

/**
 * The shared frame for every standalone public marketing page. Each page owns
 * one subject and therefore its own title, description and canonical URL —
 * which is the whole point of splitting them out of the landing page.
 *
 * Reuses `.app-about-layout` rather than introducing a parallel class: it
 * already carries the public reading measure and gutter.
 */
export function PublicSectionPage(props: PublicSectionPageProps): React.JSX.Element {
  return (
    <PageShell title={props.view.title} testId={props.testId}>
      <PageSeo
        title={props.view.seoTitle}
        description={props.view.seoDescription}
        path={props.view.path}
      />
      <div className="app-about-layout">
        <header className="app-about-hero">
          <IonText>
            <p className="app-eyebrow m-0">{props.view.eyebrow}</p>
          </IonText>
          <IonText>
            <h1 className="m-0 text-3xl font-bold">{props.view.title}</h1>
          </IonText>
        </header>
        {props.children}
      </div>
    </PageShell>
  );
}
