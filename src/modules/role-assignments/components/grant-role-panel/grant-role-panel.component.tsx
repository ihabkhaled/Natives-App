import { IonText } from '@/packages/ionic';
import { AppButton, SectionPanel, SelectField } from '@/shared/ui';

import { GRANT_PANEL_TEST_IDS } from './grant-role-panel.constants';
import type { GrantRolePanelProps } from './grant-role-panel.types';

/**
 * The grant form.
 *
 * The ceiling notice is rendered as the panel's standing advisory rather than
 * as an error after a refusal: an administrator should learn why a role is
 * missing from the list BEFORE they go hunting for it. The select holds
 * exactly the server's catalog, so there is nothing here to refuse.
 */
export function GrantRolePanel(props: GrantRolePanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} notice={view.ceilingNotice}>
      {view.emptyCatalogMessage === null ? null : (
        <IonText color="medium">
          <p className="m-0 text-sm">{view.emptyCatalogMessage}</p>
        </IonText>
      )}

      <SelectField
        label={view.roleLabel}
        value={view.roleValue}
        options={view.options}
        disabled={view.options.length === 0}
        testId={GRANT_PANEL_TEST_IDS.role}
        onChange={view.onRoleChange}
      />

      <AppButton
        label={view.submitLabel}
        tone="primary"
        loading={view.isGranting}
        disabled={!view.canSubmit}
        testId={GRANT_PANEL_TEST_IDS.submit}
        onClick={view.onSubmit}
      />
    </SectionPanel>
  );
}
