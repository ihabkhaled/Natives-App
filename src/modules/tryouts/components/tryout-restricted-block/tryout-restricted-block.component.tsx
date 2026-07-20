import { IonNote } from '@/packages/ionic';
import { FactList, PermissionState, SectionPanel } from '@/shared/ui';

import type { TryoutRestrictedBlockProps } from './tryout-restricted-block.types';

/**
 * A block of restricted candidate data. Without the matching grant the panel
 * renders the designed permission state instead of the fields — nothing is
 * fetched into the DOM and hidden with CSS.
 */
export function TryoutRestrictedBlock(props: TryoutRestrictedBlockProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} testId={props.testId}>
      {view.isPermitted ? (
        <>
          <FactList items={view.facts} ariaLabel={view.heading} />
          <IonNote>{view.notice}</IonNote>
        </>
      ) : (
        <PermissionState
          title={view.restrictedTitle}
          message={view.restrictedMessage}
          testId={props.restrictedTestId}
        />
      )}
    </SectionPanel>
  );
}
