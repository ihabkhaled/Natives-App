import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { PersonAvatar } from '../person-avatar';
import type { DirectoryCardProps } from './directory-card.types';

/** One person in the directory: portrait or initials, name, nickname, chips. */
export function DirectoryCard(props: DirectoryCardProps): React.JSX.Element {
  const card = props.card;
  return (
    <li className="app-team-card" data-testid={TEST_IDS.teamDirectoryCard}>
      <span className="app-team-card__arc" aria-hidden="true" />
      {card.jersey === null ? null : (
        <span className="app-team-card__jersey" aria-label={card.jersey.label}>
          <span aria-hidden="true">{card.jersey.text}</span>
        </span>
      )}
      <PersonAvatar
        displayName={card.displayName}
        photoUrl={card.photoUrl}
        portraitAlt={card.portraitAlt}
        avatarLabel={card.avatarLabel}
      />
      <div className="app-team-card__body">
        <IonText>
          <h4 className="app-team-card__name m-0">{card.displayName}</h4>
        </IonText>
        {card.nickname === null ? null : (
          <IonText>
            <p className="app-team-card__nickname m-0">{card.nickname}</p>
          </IonText>
        )}
        {card.tags.length === 0 ? null : (
          <ul className="app-team-card__tags">
            {card.tags.map((tag) => (
              <li key={tag} className="app-team-chip">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
