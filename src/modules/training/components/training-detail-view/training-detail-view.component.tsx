import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell } from '@/shared/ui';

import { TrainingDetailBody } from '../training-detail-body';
import { TRAINING_DETAIL_STATE_TEST_IDS } from './training-detail-view.constants';
import type { TrainingDetailViewProps } from './training-detail-view.types';

/**
 * One training claim: exactly one designed state, and the full body only once
 * the claim has actually loaded for a principal allowed to read it.
 */
export function TrainingDetailScreen(props: TrainingDetailViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.trainingDetailPage}>
      <section
        data-testid={TEST_IDS.trainingDetailView}
        aria-label={props.title}
        className="app-training-detail flex flex-col gap-5"
      >
        <AppButton label={props.backLabel} tone="ghost" onClick={props.onBack} />
        <AsyncStateView view={props} variant="detail" {...TRAINING_DETAIL_STATE_TEST_IDS} />
        {props.status === 'ready' ? <TrainingDetailBody view={props} /> : null}
      </section>
    </PageShell>
  );
}
