import { IonBadge } from '@/packages/ionic';

import type { StatusChipProps } from './status-chip.types';

/**
 * One pill of state. Tones are Ionic colour tokens so light and dark both
 * meet AA; gold stays reserved for achievements and never appears here.
 */
export function StatusChip(props: StatusChipProps): React.JSX.Element {
  const label = props.srPrefix === undefined ? props.label : `${props.srPrefix}: ${props.label}`;
  return (
    <IonBadge data-testid={props.testId} color={props.tone} className="app-status-chip">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{props.label}</span>
    </IonBadge>
  );
}
