import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell, SectionPanel } from '@/shared/ui';

import { NewsEditorForm } from '../news-editor-form';
import { NewsEditorRow } from '../news-editor-row';
import { NEWS_EDITOR_STATE_TEST_IDS } from './news-editor-view.constants';
import type { NewsEditorViewProps } from './news-editor-view.types';

/**
 * The permissioned newsroom. Every authoring affordance — the list, the new
 * draft action and the form — hangs off `canManage`, so a session without
 * `news.manage` renders none of them rather than rendering them disabled.
 */
export function NewsEditorView(props: NewsEditorViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.newsEditorPage}>
      <section
        data-testid={TEST_IDS.newsEditorView}
        aria-label={props.title}
        className="app-news-editor flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        {props.notice === null ? null : (
          <p
            className="app-pending-notice m-0"
            role="note"
            data-testid={TEST_IDS.newsEditorRevisionNotice}
          >
            {props.notice}
          </p>
        )}

        <AsyncStateView view={props} variant="list" {...NEWS_EDITOR_STATE_TEST_IDS} />

        {props.canManage ? (
          <SectionPanel heading={props.listHeading} intro={props.listIntro}>
            <AppButton
              label={props.newDraftLabel}
              tone="secondary"
              testId={TEST_IDS.newsEditorNewDraft}
              onClick={props.onNewDraft}
            />
            <ul data-testid={TEST_IDS.newsEditorList} className="app-news-editor__list">
              {props.rows.map((row) => (
                <NewsEditorRow
                  key={row.id}
                  row={row}
                  isPublishing={props.isPublishing}
                  onEdit={props.onEdit}
                  onPublish={props.onPublish}
                />
              ))}
            </ul>
          </SectionPanel>
        ) : null}

        {props.canManage ? <NewsEditorForm form={props.form} /> : null}
      </section>
    </PageShell>
  );
}
