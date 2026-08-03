import { AppButton, FactList, SectionPanel, StatusChip } from '@/shared/ui';

import { CandidateDisclosureBlock } from '../candidate-disclosure-block';
import {
  CANDIDATE_DISCLOSURE_TEST_ID_PREFIX,
  CANDIDATE_WITHDRAW_TEST_ID,
} from './candidate-detail-panel.constants';
import type { CandidateDetailPanelProps } from './candidate-detail-panel.types';

/**
 * One candidate's record: the facts anyone reviewing may see, then one block
 * per restricted grant, then the only write this screen offers.
 *
 * The restricted blocks are always rendered — restricted or not — so the
 * absence of contact details is visibly a permission boundary rather than an
 * empty record.
 */
export function CandidateDetailPanel(props: CandidateDetailPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <div className="app-tryout-candidates__detail flex flex-col gap-4">
      <SectionPanel heading={view.displayName} notice={view.notice}>
        <StatusChip label={view.statusLabel} tone={view.statusTone} />
        <FactList items={view.facts} ariaLabel={view.displayName} />
        {view.canWithdraw ? (
          <AppButton
            label={view.withdrawLabel}
            tone="danger"
            testId={CANDIDATE_WITHDRAW_TEST_ID}
            onClick={view.onWithdraw}
          />
        ) : null}
      </SectionPanel>

      {view.blocks.map((block) => (
        <CandidateDisclosureBlock
          key={block.key}
          view={block}
          testId={`${CANDIDATE_DISCLOSURE_TEST_ID_PREFIX}-${block.key}`}
        />
      ))}
    </div>
  );
}
