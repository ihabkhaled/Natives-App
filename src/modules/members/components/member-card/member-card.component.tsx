import { IonBadge, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AvatarFallback } from '@/shared/ui';

import type { MemberCardProps } from './member-card.types';

/** One tappable directory row: avatar, identity, jersey, and a status chip. */
export function MemberCard(props: MemberCardProps): React.JSX.Element {
  const { card } = props;
  return (
    <button
      type="button"
      data-testid={TEST_IDS.memberCard}
      className="app-member-card"
      aria-label={card.ariaLabel}
      onClick={() => {
        props.onSelect(card.membershipId);
      }}
    >
      <AvatarFallback name={card.name} label={card.avatarLabel} size="md" />
      <span className="app-member-card__body">
        <IonText>
          <span className="app-member-card__name">{card.name}</span>
        </IonText>
        {card.nickname === null ? null : (
          <IonText color="medium">
            <span className="app-member-card__nickname">{card.nickname}</span>
          </IonText>
        )}
        {card.positionsSummary === null ? null : (
          <IonText color="medium">
            <span className="app-member-card__positions">{card.positionsSummary}</span>
          </IonText>
        )}
      </span>
      <span className="app-member-card__meta">
        {card.jerseyLabel === null ? null : (
          <span className="app-member-card__jersey">{card.jerseyLabel}</span>
        )}
        <IonBadge color={card.statusTone}>{card.statusLabel}</IonBadge>
      </span>
    </button>
  );
}
