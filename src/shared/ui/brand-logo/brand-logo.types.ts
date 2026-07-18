export type BrandLogoSize = 'sm' | 'md' | 'lg';

export interface BrandLogoProps {
  /** Accessible text for the logo (already translated by the caller). */
  readonly label: string;
  readonly size?: BrandLogoSize;
  readonly testId?: string | undefined;
}
