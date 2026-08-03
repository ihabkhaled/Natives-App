import { AppButton, ReasonField, SectionPanel } from '@/shared/ui';

import { WITHDRAWAL_TEST_IDS } from './candidate-withdrawal-panel.constants';
import type { CandidateWithdrawalPanelProps } from './candidate-withdrawal-panel.types';

/**
 * The withdrawal step, stated before it happens.
 *
 * The consequence line is announced (`role="alert"`) rather than sitting as
 * quiet body text: a reviewer is about to take someone out of a tryout they
 * applied for, and that sentence is the last thing they should read before the
 * button. The button stays disabled until a reason has actually been written,
 * because the reason is what makes the withdrawal accountable afterwards.
 */
export function CandidateWithdrawalPanel(props: CandidateWithdrawalPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.subjectName} notice={view.notice}>
      <p className="app-pending-notice m-0 text-sm" role="alert">
        {view.consequence}
      </p>
      <ReasonField
        label={view.reasonLabel}
        placeholder={view.reasonPlaceholder}
        value={view.reason}
        validationMessage={view.validationMessage}
        testId={WITHDRAWAL_TEST_IDS.reason}
        onChange={view.onReasonChange}
      />
      <div className="flex flex-wrap gap-2">
        <AppButton
          label={view.submitLabel}
          tone="danger"
          disabled={!view.canSubmit}
          loading={view.isSubmitting}
          testId={WITHDRAWAL_TEST_IDS.confirm}
          onClick={view.onSubmit}
        />
        <AppButton
          label={view.cancelLabel}
          tone="secondary"
          testId={WITHDRAWAL_TEST_IDS.cancel}
          onClick={view.onCancel}
        />
      </div>
    </SectionPanel>
  );
}
