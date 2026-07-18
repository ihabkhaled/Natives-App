import { IonIcon } from '@/packages/ionic';

import { AVATAR_FALLBACK_DEFAULT_TEST_ID, AVATAR_FALLBACK_ICON } from './avatar-fallback.constants';
import { deriveInitials } from './avatar-fallback.helper';
import { avatarFallbackVariants } from './avatar-fallback.variants';
import type { AvatarFallbackProps } from './avatar-fallback.types';

/** Placeholder avatar showing initials, or a person icon when no name exists. */
export function AvatarFallback(props: AvatarFallbackProps): React.JSX.Element {
  const initials = props.name === undefined ? '' : deriveInitials(props.name);
  return (
    <span
      data-testid={props.testId ?? AVATAR_FALLBACK_DEFAULT_TEST_ID}
      role="img"
      aria-label={props.label}
      className={avatarFallbackVariants({ size: props.size })}
    >
      {initials === '' ? (
        <IonIcon icon={AVATAR_FALLBACK_ICON} aria-hidden="true" className="text-[1.4em]" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
