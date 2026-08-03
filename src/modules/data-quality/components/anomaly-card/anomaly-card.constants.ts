import type { AnomalySeverity } from '../../types/data-quality.types';

/** Severity drives the chip tone: an operator scans colour before text. */
export const SEVERITY_TONES: Readonly<Record<AnomalySeverity, 'danger' | 'warning' | 'medium'>> = {
  critical: 'danger',
  high: 'warning',
  medium: 'medium',
  low: 'medium',
};
