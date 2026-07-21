import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, RecordList, ReasonField, SectionPanel } from '@/shared/ui';

import type { MatchTimelinePanelProps } from './match-timeline-panel.types';

/**
 * The append-only timeline and its undo affordance.
 *
 * Undo opens a reason field rather than firing immediately: the correction is
 * a new compensating event carrying that reason, and the original point stays
 * in the stream marked as voided.
 */
export function MatchTimelinePanel(props: MatchTimelinePanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.heading}
      intro={view.intro}
      notice={view.undoBlockedNotice}
      testId={TEST_IDS.scoreboardTimeline}
    >
      <div className="app-scorekeeper__undo">
        <AppButton
          label={view.undoLabel}
          tone="ghost"
          testId={TEST_IDS.scoreboardUndo}
          disabled={view.undoDisabled}
          onClick={view.onUndoOpen}
        />
      </div>

      {view.isUndoOpen ? (
        <div className="app-scorekeeper__undo-form">
          <IonNote>{view.undoMessage}</IonNote>
          <ReasonField
            testId={TEST_IDS.scoreboardUndoReason}
            label={view.undoReasonLabel}
            placeholder={view.undoTitle}
            value={view.undoReason}
            validationMessage={null}
            onChange={view.onUndoReasonChange}
          />
          <div className="app-scorekeeper__undo-actions">
            <AppButton
              label={view.undoConfirmLabel}
              tone="danger"
              testId={TEST_IDS.scoreboardUndoConfirm}
              loading={view.isUndoRunning}
              onClick={view.onUndoConfirm}
            />
            <AppButton label={view.undoCancelLabel} tone="ghost" onClick={view.onUndoCancel} />
          </div>
        </div>
      ) : null}

      {view.rows.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <RecordList
          rows={view.rows}
          ariaLabel={view.heading}
          rowTestId={TEST_IDS.scoreboardTimelineRow}
        />
      )}
    </SectionPanel>
  );
}
