import type {
  AnomalyCardView,
  RepairPreviewView,
} from '@/modules/data-quality/types/data-quality-view.types';

/**
 * One open, repairable anomaly card. Shared by the card and screen specs so a
 * change to the view shape lands in one place rather than two.
 */
export function buildAnomalyCardView(overrides: Partial<AnomalyCardView> = {}): AnomalyCardView {
  return {
    id: 'a1',
    ruleKey: 'roster.duplicate_jersey',
    severity: 'critical',
    severityLabel: 'Critical',
    statusLabel: 'Open',
    resourceLabel: 'Affects',
    resourceRef: 'roster · roster-1',
    occurrencesLabel: 'Seen 4 times',
    lastSeenLabel: 'Last seen',
    lastSeenAt: '2026-08-01T09:00:00.000Z',
    recordVersion: 1,
    canRepair: true,
    transitions: [{ key: 'acknowledge', label: 'Acknowledge' }],
    ...overrides,
  };
}

/** A reversible repair preview, already resolved. */
export function buildRepairPreviewView(
  overrides: Partial<RepairPreviewView> = {},
): RepairPreviewView {
  return {
    heading: 'What this repair would change',
    repairKind: 'merge_duplicate_jersey',
    impactLabel: '4 records affected',
    reversibilityLabel: 'This can be undone after it is applied.',
    applyLabel: 'Apply repair',
    cancelLabel: 'Cancel',
    isApplying: false,
    onApply: (): void => undefined,
    onCancel: (): void => undefined,
    ...overrides,
  };
}
