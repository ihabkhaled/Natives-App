import { TEST_IDS } from '@/shared/config';

import type { RsvpSummaryProps } from './rsvp-summary.types';

/** The privacy-safe planning counts: no membership identifiers, just totals. */
export function RsvpSummary(props: RsvpSummaryProps): React.JSX.Element {
  return (
    <dl
      aria-label={props.headingLabel}
      className="app-section-panel flex flex-wrap gap-x-6 gap-y-2"
      data-testid={TEST_IDS.practiceRsvpDetailSummary}
    >
      <div className="flex items-baseline gap-2">
        <dt className="text-sm">{props.goingLabel}</dt>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-sm">{props.maybeLabel}</dt>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-sm">{props.notGoingLabel}</dt>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-sm">{props.noResponseLabel}</dt>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-sm">{props.waitlistedLabel}</dt>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-sm">{props.capacityLabel}</dt>
      </div>
      <div className="flex items-baseline gap-2">
        <dt className="text-sm">{props.spotsRemainingLabel}</dt>
      </div>
    </dl>
  );
}
