import { IonNote, IonTextarea } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { RawJsonDisclosureProps } from './raw-json-disclosure.types';

/**
 * The privileged raw-JSON fallback (D10): a closed-by-default disclosure only
 * a platform administrator ever receives, whose document must pass the same
 * per-key schema before it may replace the typed draft.
 */
export function RawJsonDisclosure(props: RawJsonDisclosureProps): React.JSX.Element {
  const raw = props.raw;
  return (
    <div className="app-raw-json">
      <AppButton
        label={raw.toggleLabel}
        tone="ghost"
        onClick={raw.onToggle}
        testId={TEST_IDS.adminVersionRawToggle}
      />
      {raw.isOpen ? (
        <>
          <IonNote>{raw.intro}</IonNote>
          <IonTextarea
            data-testid={TEST_IDS.adminVersionValue}
            label={raw.textLabel}
            value={raw.textValue}
            autoGrow
            onIonInput={(event) => {
              raw.onTextChange(event.detail.value ?? '');
            }}
          />
          {raw.errorMessage === null ? null : (
            <IonNote color="danger" role="alert" data-testid={TEST_IDS.adminVersionRawError}>
              {raw.errorMessage}
            </IonNote>
          )}
          <AppButton
            label={raw.applyLabel}
            tone="secondary"
            onClick={raw.onApply}
            testId={TEST_IDS.adminVersionRawApply}
          />
        </>
      ) : null}
    </div>
  );
}
