import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { FactList, PageSeo, PageShell, SectionPanel } from '@/shared/ui';

import { SpiritValuesGrid } from '../spirit-values-grid';
import type { AboutViewProps } from './about-view.types';

/** Static, fully translated About Us marketing screen. */
export function AboutView(props: AboutViewProps): React.JSX.Element {
  return (
    <PageShell title={props.heroTitle} testId={TEST_IDS.aboutPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-about-layout">
        <header className="app-about-hero">
          <IonText>
            <p className="app-eyebrow m-0">{props.heroEyebrow}</p>
          </IonText>
          <IonText>
            <h1 className="m-0 text-3xl font-bold">{props.heroTitle}</h1>
          </IonText>
        </header>

        <SectionPanel heading={props.storyHeading}>
          <IonText>
            <p className="app-about-quote m-0">{props.foundingQuote}</p>
          </IonText>
          {props.storyParagraphs.map((paragraph) => (
            <IonText key={paragraph}>
              <p className="m-0 text-base">{paragraph}</p>
            </IonText>
          ))}
        </SectionPanel>

        <SectionPanel heading={props.factsHeading}>
          <FactList
            items={props.facts}
            ariaLabel={props.factsHeading}
            testId={TEST_IDS.aboutFactList}
          />
        </SectionPanel>

        <SectionPanel heading={props.explainerHeading}>
          <IonText color="medium">
            <p className="m-0 text-base">{props.explainerBody}</p>
          </IonText>
        </SectionPanel>

        <SpiritValuesGrid
          heading={props.spiritHeading}
          intro={props.spiritIntro}
          values={props.spiritValues}
          cardTestIdPrefix={TEST_IDS.aboutSpiritValue}
        />
      </div>
    </PageShell>
  );
}
