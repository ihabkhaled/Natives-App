import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell } from '@/shared/ui';

import { AnomalyCard } from '../anomaly-card';
import { RepairPreviewPanel } from '../repair-preview-panel';
import { DATA_QUALITY_STATE_TEST_IDS } from './data-quality-view.constants';
import type { DataQualityViewProps } from './data-quality-view.types';

/**
 * The data-quality operations queue: anomalies worst-first, each offering the
 * lifecycle moves it legitimately allows, with a repair preview that must be
 * read before anything is changed.
 */
export function DataQualityView(props: DataQualityViewProps): React.JSX.Element {
  return (
    <PageShell title={props.pageTitle} testId={TEST_IDS.dataQualityPage}>
      <section
        data-testid={TEST_IDS.dataQualityView}
        aria-label={props.pageTitle}
        className="app-data-quality flex flex-col gap-5"
      >
        <header className="app-screen-intro flex items-start justify-between gap-4">
          <div>
            <h2 className="app-section-panel__title m-0">{props.queueHeading}</h2>
            <IonText color="medium">
              <p className="m-0 text-sm">{props.queueIntro}</p>
            </IonText>
          </div>
          <AppButton
            label={props.scanLabel}
            tone="secondary"
            disabled={props.isScanning}
            testId={TEST_IDS.dataQualityScanButton}
            onClick={props.onScan}
          />
        </header>

        {props.notice === null ? null : (
          <p
            className="app-pending-notice m-0"
            role="status"
            data-testid={TEST_IDS.dataQualityNotice}
          >
            {props.notice}
          </p>
        )}

        <AsyncStateView view={props} variant="list" {...DATA_QUALITY_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <IonText color="medium">
              <p className="m-0 text-sm">{props.countLabel}</p>
            </IonText>
            <ul className="app-data-quality__list m-0 flex list-none flex-col gap-3 p-0">
              {props.cards.map((card) => (
                <li key={card.id}>
                  <AnomalyCard
                    view={card}
                    previewLabel={props.previewLabel}
                    onPreview={props.onPreview}
                    onTransition={props.onTransition}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {props.preview === null ? null : <RepairPreviewPanel view={props.preview} />}
      </section>
    </PageShell>
  );
}
