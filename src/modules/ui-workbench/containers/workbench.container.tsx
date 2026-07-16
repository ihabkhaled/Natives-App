import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { WorkbenchButtons } from '../components/workbench-buttons';
import { WorkbenchForm } from '../components/workbench-form';
import { WorkbenchList } from '../components/workbench-list';
import { WorkbenchStates } from '../components/workbench-states';
import { useWorkbenchScreen } from '../hooks/use-workbench-screen.hook';

export function WorkbenchContainer(): React.JSX.Element {
  const screen = useWorkbenchScreen();
  return (
    <PageShell title={screen.title} testId={TEST_IDS.workbenchPage}>
      <div className="flex flex-col gap-6">
        <WorkbenchButtons
          heading={screen.buttonsSection}
          primaryLabel={screen.buttonPrimary}
          secondaryLabel={screen.buttonSecondary}
          dangerLabel={screen.buttonDanger}
        />
        <WorkbenchForm
          heading={screen.formSection}
          nameLabel={screen.formNameLabel}
          emailLabel={screen.formEmailLabel}
          submitLabel={screen.formSubmit}
          name={screen.form.name}
          email={screen.form.email}
          successMessage={screen.formSuccessMessage}
          onSubmit={screen.form.onSubmit}
        />
        <WorkbenchStates
          heading={screen.statesSection}
          loadingLabel={screen.stateLabels.loading}
          emptyTitle={screen.stateLabels.emptyTitle}
          emptyMessage={screen.stateLabels.emptyMessage}
          errorTitle={screen.stateLabels.errorTitle}
          retryLabel={screen.stateLabels.retry}
          offlineTitle={screen.stateLabels.offlineTitle}
          offlineMessage={screen.stateLabels.offlineMessage}
          permissionTitle={screen.stateLabels.permissionTitle}
          permissionMessage={screen.stateLabels.permissionMessage}
          onRetryDemo={screen.onStateRetryDemo}
        />
        <WorkbenchList
          heading={screen.listSection}
          items={screen.items}
          emptyTitle={screen.stateLabels.emptyTitle}
        />
      </div>
    </PageShell>
  );
}
