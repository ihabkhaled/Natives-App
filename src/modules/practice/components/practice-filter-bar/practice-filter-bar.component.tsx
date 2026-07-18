import {
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
} from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import {
  type PracticeScope,
  type PracticeType,
  type RsvpStatus,
} from '../../constants/practice.constants';
import { PRACTICE_FILTER_ALL_VALUE as ALL_VALUE } from './practice-filter-bar.constants';
import type { PracticeFilterBarProps } from './practice-filter-bar.types';

/** Calendar filter bar: scope segment plus type and RSVP selects. */
export function PracticeFilterBar(props: PracticeFilterBarProps): React.JSX.Element {
  const { filter } = props;
  return (
    <div data-testid={TEST_IDS.practiceFilterBar} className="flex flex-col gap-2">
      <IonSegment
        data-testid={TEST_IDS.practiceScopeFilter}
        value={filter.scope}
        aria-label={filter.scopeLabel}
        onIonChange={(event) => {
          filter.onScopeChange(event.detail.value as PracticeScope);
        }}
      >
        {filter.scopeOptions.map((option) => (
          <IonSegmentButton key={option.value} value={option.value}>
            <IonLabel>{option.label}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>
      <IonSelect
        data-testid={TEST_IDS.practiceTypeFilter}
        label={filter.typeLabel}
        value={filter.type ?? ALL_VALUE}
        onIonChange={(event) => {
          const value = event.detail.value as string;
          filter.onTypeChange(value === ALL_VALUE ? null : (value as PracticeType));
        }}
      >
        <IonSelectOption value={ALL_VALUE}>{filter.typeAllLabel}</IonSelectOption>
        {filter.typeOptions.map((option) => (
          <IonSelectOption key={option.value} value={option.value}>
            {option.label}
          </IonSelectOption>
        ))}
      </IonSelect>
      <IonSelect
        data-testid={TEST_IDS.practiceRsvpFilter}
        label={filter.rsvpLabel}
        value={filter.rsvp ?? ALL_VALUE}
        onIonChange={(event) => {
          const value = event.detail.value as string;
          filter.onRsvpChange(value === ALL_VALUE ? null : (value as RsvpStatus));
        }}
      >
        <IonSelectOption value={ALL_VALUE}>{filter.rsvpAllLabel}</IonSelectOption>
        {filter.rsvpOptions.map((option) => (
          <IonSelectOption key={option.value} value={option.value}>
            {option.label}
          </IonSelectOption>
        ))}
      </IonSelect>
    </div>
  );
}
