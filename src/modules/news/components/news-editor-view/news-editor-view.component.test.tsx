import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildNewsEditorScreenView } from '../../../../../tests/factories/news-view.factory';
import { NewsEditorView } from './news-editor-view.component';

describe('NewsEditorView', () => {
  it('lists drafts alongside published stories', () => {
    render(<NewsEditorView {...buildNewsEditorScreenView()} />);
    const rows = screen.getAllByTestId(TEST_IDS.newsEditorRow);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Published');
    expect(rows[1]).toHaveTextContent('Draft');
  });

  it('offers publish only where there is something left to publish', () => {
    render(<NewsEditorView {...buildNewsEditorScreenView()} />);

    // Two rows, one already public: exactly one publish affordance.
    expect(screen.getAllByTestId(TEST_IDS.newsEditorRowPublish)).toHaveLength(1);
    expect(screen.getAllByTestId(TEST_IDS.newsEditorRowEdit)).toHaveLength(2);
  });

  it('routes edit and publish by story id', () => {
    const onEdit = vi.fn();
    const onPublish = vi.fn();
    render(<NewsEditorView {...buildNewsEditorScreenView({ onEdit, onPublish })} />);
    fireEvent.click(screen.getAllByTestId(TEST_IDS.newsEditorRowEdit)[0] as HTMLElement);
    fireEvent.click(screen.getByTestId(TEST_IDS.newsEditorRowPublish));

    expect(onEdit).toHaveBeenCalledWith('news-1');
    expect(onPublish).toHaveBeenCalledWith('news-2');
  });

  it('warns that writes go nowhere while the seam is a stub', () => {
    render(<NewsEditorView {...buildNewsEditorScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.newsEditorRevisionNotice)).toHaveTextContent(
      'Publishing is not connected yet.',
    );
  });

  it('renders the form fields and their labels', () => {
    render(<NewsEditorView {...buildNewsEditorScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.newsEditorForm)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsEditorTitleInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsEditorBodyInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsEditorCoverInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsEditorCompetitionInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsEditorMatchInput)).toBeInTheDocument();
  });

  it('states the revision consequence above a published story form', () => {
    const view = buildNewsEditorScreenView();
    render(
      <NewsEditorView
        {...view}
        form={{
          ...view.form,
          heading: 'New revision',
          revisionNotice: 'Saving creates a new revision.',
        }}
      />,
    );

    expect(screen.getByText('New revision')).toBeInTheDocument();
    expect(screen.getByText('Saving creates a new revision.')).toBeInTheDocument();
  });

  it('renders NOTHING editable for a session without the grant', () => {
    render(
      <NewsEditorView {...buildNewsEditorScreenView({ canManage: false, status: 'forbidden' })} />,
    );

    expect(screen.getByTestId(TEST_IDS.newsEditorForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsEditorForm)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsEditorList)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsEditorNewDraft)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsEditorRowEdit)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsEditorRowPublish)).not.toBeInTheDocument();
  });

  it('starts a new draft and cancels back out', () => {
    const view = buildNewsEditorScreenView();
    render(<NewsEditorView {...view} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.newsEditorNewDraft));
    fireEvent.click(screen.getByTestId(TEST_IDS.newsEditorCancel));

    expect(view.onNewDraft).toHaveBeenCalledTimes(1);
    expect(view.form.onCancel).toHaveBeenCalledTimes(1);
  });

  it('submits the form through its own handler', () => {
    const view = buildNewsEditorScreenView();
    render(<NewsEditorView {...view} />);
    fireEvent.submit(screen.getByTestId(TEST_IDS.newsEditorForm));

    expect(view.form.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows the loading skeleton while the newsroom read is pending', () => {
    render(<NewsEditorView {...buildNewsEditorScreenView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.newsEditorLoading)).toBeInTheDocument();
  });
});
