import { IonNote } from '@/packages/ionic';
import { FactList, PermissionState, SectionPanel } from '@/shared/ui';

import type { CandidateDisclosureBlockProps } from './candidate-disclosure-block.types';

/**
 * One block of restricted candidate data.
 *
 * When the block is withheld the panel renders the designed restricted state
 * instead of the fields. Two things follow from that, and both are the point:
 * the values are never in the DOM waiting to be un-hidden by CSS, and a
 * reviewer is told the data is restricted rather than shown a blank that reads
 * as "this person told us nothing".
 */
export function CandidateDisclosureBlock(props: CandidateDisclosureBlockProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} testId={props.testId}>
      {view.isDisclosed ? (
        <>
          <FactList items={view.facts} ariaLabel={view.heading} />
          <IonNote>{view.notice}</IonNote>
        </>
      ) : (
        <PermissionState title={view.withheldTitle} message={view.withheldMessage} />
      )}
    </SectionPanel>
  );
}
