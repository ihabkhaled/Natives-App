import { TEST_IDS } from '@/shared/config';
import { AvatarFallback } from '@/shared/ui';

import type { PersonAvatarProps } from './person-avatar.types';

/**
 * A person's portrait, or a deliberately branded initials medallion when the
 * directory has no `photoUrl` yet. Both render inside the same lime-ringed
 * frame at the same size, so a card with no photo reads as a design choice
 * rather than a broken image.
 */
export function PersonAvatar(props: PersonAvatarProps): React.JSX.Element {
  return (
    <span className="app-team-avatar">
      <span className="app-team-avatar__ring" aria-hidden="true" />
      {props.photoUrl === null ? (
        <AvatarFallback
          label={props.avatarLabel}
          name={props.displayName}
          size="lg"
          testId={TEST_IDS.teamDirectoryAvatarInitials}
        />
      ) : (
        <img
          className="app-team-avatar__photo"
          src={props.photoUrl}
          alt={props.portraitAlt}
          loading="lazy"
          decoding="async"
          data-testid={TEST_IDS.teamDirectoryAvatarPhoto}
        />
      )}
    </span>
  );
}
