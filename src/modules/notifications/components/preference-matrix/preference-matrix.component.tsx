import { IonCheckbox, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { SectionPanel, StatusChip } from '@/shared/ui';

import type { PreferenceMatrixProps } from './preference-matrix.types';

/**
 * The category × channel switch grid. A mandatory cell renders disabled with
 * an "always on" chip and the stated reason, so the screen never pretends a
 * security notice could be muted.
 */
export function PreferenceMatrix(props: PreferenceMatrixProps): React.JSX.Element {
  return (
    <SectionPanel
      heading={props.heading}
      intro={props.intro}
      notice={props.mandatoryNotice}
      testId={TEST_IDS.notificationPrefsMatrix}
    >
      <ul className="app-prefs__rows">
        {props.rows.map((row) => (
          <li key={row.key} data-testid={TEST_IDS.notificationPrefsRow} className="app-prefs__row">
            <div className="app-prefs__row-head">
              <IonText>
                <h3 className="app-prefs__row-title m-0">{row.categoryLabel}</h3>
              </IonText>
              {row.mandatoryLabel === null ? null : (
                <StatusChip
                  label={row.mandatoryLabel}
                  tone="warning"
                  testId={TEST_IDS.notificationPrefsMandatory}
                />
              )}
            </div>
            <div className="app-prefs__cells">
              {row.cells.map((cell) => (
                <IonCheckbox
                  key={cell.key}
                  data-testid={TEST_IDS.notificationPrefsToggle}
                  className="app-prefs__cell"
                  checked={cell.enabled}
                  disabled={cell.locked}
                  labelPlacement="end"
                  justify="start"
                  onIonChange={cell.onToggle}
                >
                  {cell.channelLabel}
                </IonCheckbox>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}
