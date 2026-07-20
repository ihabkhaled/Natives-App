import { TEST_IDS } from '@/shared/config';
import { AppButton, AvatarFallback } from '@/shared/ui';

import type { MemberAvatarProps } from './member-avatar.types';

/** Avatar display with an initials fallback, broken-image resilience, and upload. */
export function MemberAvatar(props: MemberAvatarProps): React.JSX.Element {
  const { avatar } = props;
  return (
    <div
      className="app-member-avatar flex flex-col items-center gap-2"
      data-testid={TEST_IDS.memberAvatar}
    >
      <span className="app-member-avatar__frame">
        <AvatarFallback name={avatar.name} label={avatar.label} size="lg" />
        {avatar.url === null ? null : (
          <img
            data-testid={TEST_IDS.memberAvatarImage}
            className="app-member-avatar__image"
            src={avatar.url}
            alt={avatar.imageAlt}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}
      </span>
      {avatar.canUpload ? (
        <AppButton
          testId={TEST_IDS.memberAvatarUpload}
          label={avatar.isUploading ? avatar.uploadingLabel : avatar.uploadLabel}
          tone="secondary"
          loading={avatar.isUploading}
          onClick={avatar.onUpload}
        />
      ) : null}
    </div>
  );
}
