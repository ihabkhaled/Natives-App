import type { ScreenCopy } from '@/shared/view';
import type { AsyncViewStatus } from '@/shared/ui';

import type { AnomalySeverity, AnomalyTransition } from './data-quality.types';

interface AnomalyTransitionView {
  readonly key: AnomalyTransition;
  readonly label: string;
}

export interface AnomalyCardView {
  readonly id: string;
  readonly ruleKey: string;
  readonly severity: AnomalySeverity;
  readonly severityLabel: string;
  readonly statusLabel: string;
  readonly resourceLabel: string;
  readonly resourceRef: string;
  readonly occurrencesLabel: string;
  readonly lastSeenLabel: string;
  readonly lastSeenAt: string;
  readonly recordVersion: number;
  /** False once an operator has closed it — repairing then would undo their call. */
  readonly canRepair: boolean;
  readonly transitions: readonly AnomalyTransitionView[];
}

/** The repair preview, shown before anything is changed. */
export interface RepairPreviewView {
  readonly heading: string;
  readonly repairKind: string;
  readonly impactLabel: string;
  readonly reversibilityLabel: string;
  readonly applyLabel: string;
  readonly cancelLabel: string;
  readonly isApplying: boolean;
  readonly onApply: () => void;
  readonly onCancel: () => void;
}

export interface DataQualityScreenView extends ScreenCopy {
  readonly path: string;
  readonly pageTitle: string;
  readonly status: AsyncViewStatus;
  readonly queueHeading: string;
  readonly queueIntro: string;
  readonly countLabel: string;
  readonly scanLabel: string;
  readonly isScanning: boolean;
  readonly onScan: () => void;
  readonly notice: string | null;
  readonly cards: readonly AnomalyCardView[];
  readonly previewLabel: string;
  readonly onPreview: (anomalyId: string) => void;
  readonly onTransition: (anomalyId: string, transition: AnomalyTransition) => void;
  readonly preview: RepairPreviewView | null;
}
