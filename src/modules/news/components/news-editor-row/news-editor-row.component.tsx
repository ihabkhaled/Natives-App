import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { NewsEditorRowProps } from './news-editor-row.types';

/**
 * One story in the newsroom list. A published story keeps its Edit action —
 * editing it opens a revision rather than mutating it — and loses Publish,
 * because what is already public has nothing left to publish.
 */
export function NewsEditorRow(props: NewsEditorRowProps): React.JSX.Element {
  const { row } = props;
  return (
    <li data-testid={TEST_IDS.newsEditorRow} className="app-surface-card app-news-editor__row">
      <div className="app-news-editor__row-main">
        <IonText>
          <h3 className="app-news-editor__row-title m-0">{row.title}</h3>
        </IonText>
        <IonNote>{row.dateLabel}</IonNote>
      </div>
      <div className="app-news-editor__row-meta">
        <StatusChip label={row.statusLabel} tone={row.statusTone} />
        <AppButton
          label={row.editLabel}
          tone="ghost"
          testId={TEST_IDS.newsEditorRowEdit}
          onClick={() => {
            props.onEdit(row.id);
          }}
        />
        {row.isPublished ? null : (
          <AppButton
            label={row.publishLabel}
            tone="primary"
            loading={props.isPublishing}
            testId={TEST_IDS.newsEditorRowPublish}
            onClick={() => {
              props.onPublish(row.id);
            }}
          />
        )}
      </div>
    </li>
  );
}
