import { TEST_IDS } from '@/shared/config';
import { AppButton, AppInput, ReasonField, SectionPanel } from '@/shared/ui';

import type { NewsEditorFormProps } from './news-editor-form.types';

/**
 * The story form. When the target is a PUBLISHED story the revision notice is
 * pinned above the fields, so an author learns that saving forks a revision
 * BEFORE they type — the domain rule is stated, never inferred from a
 * surprise afterwards.
 */
export function NewsEditorForm(props: NewsEditorFormProps): React.JSX.Element {
  const { form } = props;
  return (
    <SectionPanel heading={form.heading} notice={form.revisionNotice}>
      <form
        onSubmit={form.onSubmit}
        noValidate
        className="flex flex-col gap-4"
        data-testid={TEST_IDS.newsEditorForm}
      >
        <AppInput
          label={form.titleLabel}
          name={form.titleField.name}
          value={form.titleField.value}
          onValueChange={form.titleField.onChange}
          onBlur={form.titleField.onBlur}
          placeholder={form.titlePlaceholder}
          errorMessage={form.titleField.errorMessage}
          testId={TEST_IDS.newsEditorTitleInput}
        />
        <ReasonField
          label={form.bodyLabel}
          placeholder={form.bodyPlaceholder}
          value={form.bodyField.value}
          validationMessage={form.bodyField.errorMessage ?? null}
          onChange={form.bodyField.onChange}
          testId={TEST_IDS.newsEditorBodyInput}
        />
        <AppInput
          label={form.coverLabel}
          name={form.coverField.name}
          value={form.coverField.value}
          onValueChange={form.coverField.onChange}
          onBlur={form.coverField.onBlur}
          placeholder={form.coverPlaceholder}
          errorMessage={form.coverField.errorMessage}
          testId={TEST_IDS.newsEditorCoverInput}
        />
        <AppInput
          label={form.competitionLabel}
          name={form.competitionField.name}
          value={form.competitionField.value}
          onValueChange={form.competitionField.onChange}
          onBlur={form.competitionField.onBlur}
          placeholder={form.competitionPlaceholder}
          errorMessage={form.competitionField.errorMessage}
          testId={TEST_IDS.newsEditorCompetitionInput}
        />
        <AppInput
          label={form.matchLabel}
          name={form.matchField.name}
          value={form.matchField.value}
          onValueChange={form.matchField.onChange}
          onBlur={form.matchField.onBlur}
          placeholder={form.matchPlaceholder}
          errorMessage={form.matchField.errorMessage}
          testId={TEST_IDS.newsEditorMatchInput}
        />
        <div className="app-news-editor__actions">
          <AppButton
            label={form.submitLabel}
            type="submit"
            loading={form.isSubmitting}
            testId={TEST_IDS.newsEditorSubmit}
          />
          <AppButton
            label={form.cancelLabel}
            tone="ghost"
            onClick={form.onCancel}
            testId={TEST_IDS.newsEditorCancel}
          />
        </div>
      </form>
    </SectionPanel>
  );
}
