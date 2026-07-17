import { IonNote, IonText } from '@/packages/ionic';
import { AppButton, AppInput } from '@/shared/ui';

import { WORKBENCH_FORM_TEST_IDS } from './workbench-form.constants';
import type { WorkbenchFormProps } from './workbench-form.types';

export function WorkbenchForm(props: WorkbenchFormProps): React.JSX.Element {
  return (
    <section data-testid={WORKBENCH_FORM_TEST_IDS.section} className="flex flex-col gap-2">
      <IonText>
        <h2 className="m-0 text-lg font-semibold">{props.heading}</h2>
      </IonText>
      <form onSubmit={props.onSubmit} noValidate className="flex flex-col gap-3">
        <AppInput
          label={props.nameLabel}
          name={props.name.name}
          value={props.name.value}
          onValueChange={props.name.onChange}
          onBlur={props.name.onBlur}
          errorMessage={props.name.errorMessage}
          testId={WORKBENCH_FORM_TEST_IDS.name}
        />
        <AppInput
          label={props.emailLabel}
          name={props.email.name}
          value={props.email.value}
          onValueChange={props.email.onChange}
          onBlur={props.email.onBlur}
          type="email"
          errorMessage={props.email.errorMessage}
          testId={WORKBENCH_FORM_TEST_IDS.email}
        />
        {props.successMessage === undefined ? null : (
          <IonNote color="success" role="status" data-testid={WORKBENCH_FORM_TEST_IDS.result}>
            {props.successMessage}
          </IonNote>
        )}
        <AppButton
          label={props.submitLabel}
          type="submit"
          testId={WORKBENCH_FORM_TEST_IDS.submit}
        />
      </form>
    </section>
  );
}
