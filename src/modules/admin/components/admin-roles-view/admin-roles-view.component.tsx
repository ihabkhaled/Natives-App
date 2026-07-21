import { IonCheckbox, IonNote, IonText, IonTextarea } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell, SectionPanel, SelectField } from '@/shared/ui';

import { ROLES_STATE_TEST_IDS } from './admin-roles-view.constants';
import type { AdminRolesViewProps } from './admin-roles-view.types';

/** RBAC assignment bounded by the acting principal's privilege ceiling. */
export function AdminRolesView(props: AdminRolesViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.adminRolesPage}>
      <section
        data-testid={TEST_IDS.adminRolesView}
        aria-label={props.title}
        className="app-admin-roles flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <AsyncStateView view={props} variant="list" {...ROLES_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <SelectField
              label={props.memberLabel}
              value={props.memberValue}
              options={props.memberOptions}
              onChange={props.onMemberChange}
              testId={TEST_IDS.adminRolesMemberSelect}
            />

            {props.hasSelection ? (
              <SectionPanel
                heading={props.assignableHeading}
                intro={props.ceilingNotice}
                notice={props.noAssignableLabel}
                testId={TEST_IDS.adminRolesPanel}
              >
                <p data-testid={TEST_IDS.adminRolesCurrent} className="m-0">
                  {`${props.currentHeading}: ${props.currentLabel}`}
                </p>
                <div
                  data-testid={TEST_IDS.adminRolesAssignable}
                  className="app-admin-roles__toggles"
                >
                  {props.toggles.map((toggle) => (
                    <IonCheckbox
                      key={toggle.key}
                      data-testid={TEST_IDS.adminRolesToggle}
                      checked={toggle.selected}
                      labelPlacement="end"
                      justify="start"
                      onIonChange={toggle.onToggle}
                    >
                      {toggle.label}
                    </IonCheckbox>
                  ))}
                </div>
                <IonTextarea
                  data-testid={TEST_IDS.adminRolesReason}
                  label={props.reasonLabel}
                  placeholder={props.reasonPlaceholder}
                  value={props.reasonValue}
                  autoGrow
                  onIonInput={(event) => {
                    props.onReasonChange(event.detail.value ?? '');
                  }}
                />
                {props.validationMessage === null ? null : (
                  <IonNote color="danger">{props.validationMessage}</IonNote>
                )}
                <AppButton
                  label={props.saveLabel}
                  tone="primary"
                  loading={props.isSaving}
                  disabled={!props.canSave}
                  testId={TEST_IDS.adminRolesSave}
                  onClick={props.onSave}
                />
              </SectionPanel>
            ) : (
              <IonNote data-testid={TEST_IDS.adminRolesCeiling}>{props.selectPrompt}</IonNote>
            )}
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
