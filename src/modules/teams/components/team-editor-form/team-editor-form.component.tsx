import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, SectionPanel } from '@/shared/ui';

import { AdminSlugField } from '../admin-slug-field';

import type { TeamEditorFormProps } from './team-editor-form.types';

/** Create or edit a team. The slug is read-only once the team exists. */
export function TeamEditorForm(props: TeamEditorFormProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.heading} intro={view.intro} testId={TEST_IDS.teamEditorForm}>
      <AdminSlugField field={view.slug} name="team-slug" testId={TEST_IDS.teamEditorSlug} />
      <AppInput
        testId={TEST_IDS.teamEditorName}
        label={view.name.label}
        name="team-name"
        value={view.name.value}
        onValueChange={view.name.onChange}
        errorMessage={view.name.error ?? undefined}
      />
      <AppInput
        testId={TEST_IDS.teamEditorTimezone}
        label={view.timezone.label}
        name="team-timezone"
        value={view.timezone.value}
        onValueChange={view.timezone.onChange}
      />
      <AppInput
        testId={TEST_IDS.teamEditorLocale}
        label={view.locale.label}
        name="team-locale"
        value={view.locale.value}
        onValueChange={view.locale.onChange}
      />
      <AppInput
        testId={TEST_IDS.teamEditorColor}
        label={view.color.label}
        name="team-color"
        value={view.color.value}
        onValueChange={view.color.onChange}
      />
      <div className="app-member-form__actions flex gap-2">
        <AppButton
          testId={TEST_IDS.teamEditorCancel}
          label={view.cancelLabel}
          tone="secondary"
          onClick={view.onCancel}
        />
        <AppButton
          testId={TEST_IDS.teamEditorSubmit}
          label={view.submitLabel}
          tone="primary"
          loading={view.isSaving}
          onClick={view.onSubmit}
        />
      </div>
    </SectionPanel>
  );
}
