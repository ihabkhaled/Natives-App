import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonNote,
} from '@/packages/ionic';
import { AppButton, ErrorState, LoadingState } from '@/shared/ui';

import { HEALTH_CARD_TEST_IDS } from './health-status-card.constants';
import type { HealthStatusCardProps } from './health-status-card.types';

export function HealthStatusCard(props: HealthStatusCardProps): React.JSX.Element {
  return (
    <IonCard data-testid={HEALTH_CARD_TEST_IDS.card}>
      <IonCardHeader>
        <IonCardTitle>{props.title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {props.isLoading ? <LoadingState label={props.loadingLabel} /> : null}
        {!props.isLoading && props.errorMessage !== undefined ? (
          <ErrorState
            title={props.errorMessage}
            retryLabel={props.retryLabel}
            onRetry={props.onRefresh}
          />
        ) : null}
        {!props.isLoading && props.errorMessage === undefined ? (
          <div className="flex flex-col gap-2">
            <IonBadge
              className="app-health-status-badge"
              color={props.isHealthy ? 'success' : 'danger'}
              data-testid={HEALTH_CARD_TEST_IDS.status}
            >
              {props.statusLabel}
            </IonBadge>
            <IonNote>
              {props.versionLabel}: {props.version}
            </IonNote>
            <IonNote>
              {props.checkedAtLabel}: {props.checkedAtText}
            </IonNote>
            <AppButton
              label={props.retryLabel}
              tone="secondary"
              onClick={props.onRefresh}
              testId={HEALTH_CARD_TEST_IDS.refresh}
            />
          </div>
        ) : null}
      </IonCardContent>
    </IonCard>
  );
}
