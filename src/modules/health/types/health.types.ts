export interface HealthStatus {
  readonly isHealthy: boolean;
  readonly version: string;
  readonly checkedAtIso: string;
}
