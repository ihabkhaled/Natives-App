export interface PersonAvatarProps {
  /** The person's display name; initials are derived from it. */
  readonly displayName: string;
  /** Published portrait, or null while photos are not in the assets yet. */
  readonly photoUrl: string | null;
  /** Translated `alt` text for a real portrait. */
  readonly portraitAlt: string;
  /** Translated accessible name for the initials fallback. */
  readonly avatarLabel: string;
}
