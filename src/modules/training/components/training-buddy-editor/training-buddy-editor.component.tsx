import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SelectField } from '@/shared/ui';

import { TrainingPanelHeading } from '../training-panel-heading';
import type { TrainingBuddyEditorProps } from './training-buddy-editor.types';

/**
 * Training-buddy picker. Naming a buddy is an invitation, never an assertion:
 * each named member confirms or declines for themselves on their own screen.
 */
export function TrainingBuddyEditor(props: TrainingBuddyEditorProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      data-testid={TEST_IDS.trainingBuddyPanel}
      aria-label={view.heading}
      className="app-training-panel"
    >
      <TrainingPanelHeading heading={view.heading} intro={view.intro} />
      <div className="app-training-buddy__form">
        <SelectField
          testId={TEST_IDS.trainingBuddySelect}
          label={view.addFieldLabel}
          value={view.value}
          options={view.options}
          onChange={view.onValueChange}
        />
        <AppButton
          label={view.addLabel}
          tone="secondary"
          disabled={!view.canAdd}
          onClick={view.onAdd}
          testId={TEST_IDS.trainingBuddyAdd}
        />
      </div>
      {view.selected.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <ul className="app-training-chiplist">
          {view.selected.map((option) => (
            <li key={option.value} data-testid={TEST_IDS.trainingBuddyItem}>
              <span className="app-training-chiplist__value">{option.label}</span>
              <AppButton
                label={view.removeLabel}
                tone="ghost"
                onClick={() => {
                  view.onRemove(option.value);
                }}
                testId={TEST_IDS.trainingBuddyRemove}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
