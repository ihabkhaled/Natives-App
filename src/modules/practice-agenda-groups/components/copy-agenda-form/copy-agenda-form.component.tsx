import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput } from '@/shared/ui';

import type { CopyAgendaFormProps } from './copy-agenda-form.types';

/** Copy an agenda from another session instead of rebuilding this one block by block. */
export function CopyAgendaForm(props: CopyAgendaFormProps): React.JSX.Element {
  return (
    <section
      aria-label={props.heading}
      data-testid={TEST_IDS.practiceAgendaGroupsCopyForm}
      className="app-section-panel flex flex-col gap-2"
    >
      <h2 className="app-section-panel__title m-0">{props.heading}</h2>
      <AppInput
        label={props.sourceLabel}
        name="agenda-copy-source"
        value={props.sourceValue}
        testId={TEST_IDS.practiceAgendaGroupsCopySource}
        onValueChange={props.onSourceChange}
      />
      <AppButton
        label={props.submitLabel}
        tone="secondary"
        disabled={!props.canSubmit}
        loading={props.isCopying}
        testId={TEST_IDS.practiceAgendaGroupsCopySubmit}
        onClick={props.onSubmit}
      />
    </section>
  );
}
