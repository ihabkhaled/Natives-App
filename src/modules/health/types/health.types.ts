export interface HealthStatus {
  readonly isHealthy: boolean;
  /** Build version when the probe reports one; the deployed probe does not. */
  readonly version: string | null;
  readonly checkedAtIso: string;
}
