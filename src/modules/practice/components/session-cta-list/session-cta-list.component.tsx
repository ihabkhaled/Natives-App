import { TEST_IDS } from '@/shared/config';

import { SessionCtaCard } from '../session-cta-card';
import type { SessionCtaListProps } from './session-cta-list.types';

/**
 * The session-scoped entry points a viewer is permitted to open.
 *
 * Each CTA is `null` unless its grant is held, so this renders nothing for a
 * plain member and grows without adding branches to the detail screen — which
 * is why it is a component rather than two conditionals inline.
 */
export function SessionCtaList(props: SessionCtaListProps): React.JSX.Element {
  return (
    <>
      {props.attendanceCta === null ? null : (
        <SessionCtaCard
          heading={props.attendanceCta.heading}
          label={props.attendanceCta.label}
          testId={TEST_IDS.practiceSessionAttendanceCta}
          onOpen={props.attendanceCta.onOpen}
        />
      )}
      {props.remindersCta === null ? null : (
        <SessionCtaCard
          heading={props.remindersCta.heading}
          label={props.remindersCta.label}
          testId={TEST_IDS.practiceSessionRemindersCta}
          onOpen={props.remindersCta.onOpen}
        />
      )}
      {props.rsvpDetailCta === null ? null : (
        <SessionCtaCard
          heading={props.rsvpDetailCta.heading}
          label={props.rsvpDetailCta.label}
          testId={TEST_IDS.practiceSessionRsvpDetailCta}
          onOpen={props.rsvpDetailCta.onOpen}
        />
      )}
    </>
  );
}
