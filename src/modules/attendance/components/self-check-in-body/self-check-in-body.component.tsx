import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, StatusChip } from '@/shared/ui';

import type { SelfCheckInBodyProps } from './self-check-in-body.types';

/**
 * The resolved check-in body: the session line (or the honest no-session
 * message), the recorded chip, the window state copy, and — only inside an
 * open window — the note field with the armed check-in action.
 */
export function SelfCheckInBody(props: SelfCheckInBodyProps): React.JSX.Element {
  const { view } = props;
  return (
    <div className="flex flex-col gap-3">
      {view.sessionLabel === null ? (
        <IonNote className="block">{view.noSessionMessage}</IonNote>
      ) : (
        <IonText>
          <p className="m-0 text-sm font-semibold">{view.sessionLabel}</p>
        </IonText>
      )}
      {view.statusChip === null ? null : (
        <div>
          <StatusChip
            label={view.statusChip.label}
            tone={view.statusChip.tone}
            testId={TEST_IDS.myAttendanceCheckInStatus}
          />
        </div>
      )}
      {view.stateMessage === null ? null : <IonNote className="block">{view.stateMessage}</IonNote>}
      {view.offlineNotice === null ? null : (
        <IonNote color="warning" className="block" role="status">
          {view.offlineNotice}
        </IonNote>
      )}
      {view.canCheckIn ? (
        <div className="flex flex-col gap-3">
          <AppInput
            label={view.noteLabel}
            name="check-in-note"
            value={view.noteValue}
            testId={TEST_IDS.myAttendanceCheckInNote}
            onValueChange={view.onNoteChange}
          />
          <AppButton
            label={view.checkInLabel}
            loading={view.isSubmitting}
            expand
            testId={TEST_IDS.myAttendanceCheckInButton}
            onClick={view.onCheckIn}
          />
          {view.provisionalNotice === null ? null : (
            <IonNote className="block text-xs">{view.provisionalNotice}</IonNote>
          )}
        </div>
      ) : null}
    </div>
  );
}
