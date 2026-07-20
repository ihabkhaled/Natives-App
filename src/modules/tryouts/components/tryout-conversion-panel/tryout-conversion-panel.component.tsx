import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, FactList, SectionPanel } from '@/shared/ui';

import type { TryoutConversionPanelProps } from './tryout-conversion-panel.types';

/** Conversion preview then explicit confirmation. Converting twice is a no-op. */
export function TryoutConversionPanel(props: TryoutConversionPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.heading}
      intro={view.intro}
      notice={view.forbiddenNotice ?? view.blockedNotice}
      testId={TEST_IDS.tryoutConversionPanel}
    >
      <div data-testid={TEST_IDS.tryoutConversionPreview} className="app-conversion__preview">
        <FactList items={view.previewFacts} ariaLabel={view.previewHeading} />
        <IonNote>{view.accountNotice}</IonNote>
      </div>
      <AppButton
        label={view.confirmLabel}
        tone="primary"
        testId={TEST_IDS.tryoutConversionConfirm}
        disabled={view.blockedNotice !== null || view.forbiddenNotice !== null}
        loading={view.isSaving}
        onClick={view.onConfirm}
      />
    </SectionPanel>
  );
}
