export type AvatarFallbackSize = 'sm' | 'md' | 'lg';

export interface AvatarFallbackProps {
  /** Accessible label for the avatar (already translated by the caller). */
  readonly label: string;
  /** Optional display name; initials are derived from it when present. */
  readonly name?: string | undefined;
  readonly size?: AvatarFallbackSize;
  readonly testId?: string | undefined;
}
