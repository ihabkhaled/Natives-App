export interface StatusChipProps {
  /** Already-translated label. */
  readonly label: string;
  /** Ionic colour token; never a raw hex value. */
  readonly tone: string;
  /** Optional prefix read by assistive tech before the label. */
  readonly srPrefix?: string;
  readonly testId?: string;
}
