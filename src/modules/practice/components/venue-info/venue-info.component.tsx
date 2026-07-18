import { APP_ICONS } from '@/packages/icons';
import { IonButton, IonIcon, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { VenueInfoProps } from './venue-info.types';

/** Venue block: name, address, directions link, and public arrival notes. */
export function VenueInfo(props: VenueInfoProps): React.JSX.Element {
  const { venue } = props;
  const mapUrl = venue?.mapUrl ?? null;
  return (
    <section data-testid={TEST_IDS.practiceVenueInfo} aria-label={props.heading}>
      <IonText>
        <h2 className="m-0 mb-1 text-base font-semibold">{props.heading}</h2>
      </IonText>
      {venue === null ? (
        <IonNote>{props.tbdLabel}</IonNote>
      ) : (
        <div className="flex flex-col gap-1">
          <IonText>
            <p className="m-0 font-medium">{venue.name}</p>
          </IonText>
          {venue.addressLine === null ? null : (
            <IonNote className="text-sm">{venue.addressLine}</IonNote>
          )}
          {mapUrl === null ? null : (
            <IonButton
              fill="outline"
              size="small"
              className="self-start"
              onClick={() => {
                props.onOpenMap(mapUrl);
              }}
            >
              <IonIcon icon={APP_ICONS.location} slot="start" aria-hidden="true" />
              {venue.directionsLabel}
            </IonButton>
          )}
          {venue.notes === null ? null : (
            <div className="mt-1">
              <IonText>
                <h3 className="m-0 text-sm font-semibold">{venue.notesHeading}</h3>
              </IonText>
              <IonNote className="text-sm">{venue.notes}</IonNote>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
