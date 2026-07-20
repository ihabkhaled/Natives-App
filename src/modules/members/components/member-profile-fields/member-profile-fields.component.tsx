import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { MemberProfileFieldsProps } from './member-profile-fields.types';

/** Audience-shaped profile fields as an accessible description list. */
export function MemberProfileFields(props: MemberProfileFieldsProps): React.JSX.Element {
  return (
    <section
      data-testid={TEST_IDS.memberProfileFields}
      aria-label={props.heading}
      className="app-panel app-profile-fields flex flex-col gap-2"
    >
      <IonText>
        <h2 className="app-panel__heading m-0">{props.heading}</h2>
      </IonText>
      {props.restrictedNotice === null ? null : (
        <IonNote className="app-profile-fields__notice">{props.restrictedNotice}</IonNote>
      )}
      <dl className="app-profile-fields__list">
        {props.fields.map((field) => (
          <div key={field.key} className="app-profile-fields__row">
            <dt className="app-profile-fields__label">{field.label}</dt>
            <dd className="app-profile-fields__value">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
