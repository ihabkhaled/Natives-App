import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildBuddyEditorView,
  buildComposerView,
  buildEvidenceEditorView,
} from '../../../../../tests/factories/training-view.factory';
import { TrainingBuddyEditor } from '../training-buddy-editor';
import { TrainingEvidenceEditor } from '../training-evidence-editor';
import { TrainingComposer } from './training-composer.component';

describe('TrainingComposer', () => {
  it('shows the pending candidate readout with its explanation', () => {
    render(<TrainingComposer view={buildComposerView()} />);

    const candidate = screen.getByTestId(TEST_IDS.trainingCandidatePoints);
    expect(candidate).toHaveTextContent('Pending');
    expect(candidate).toHaveTextContent('No approved point value yet.');
  });

  it('swaps the explanation for the server-awards notice once a value exists', () => {
    render(
      <TrainingComposer
        view={buildComposerView({ hasCandidate: true, candidateLabel: '5 candidate points' })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.trainingCandidatePoints)).toHaveTextContent(
      'Candidate only.',
    );
  });

  it('hides the amount field until the chosen type declares a unit', () => {
    const { rerender } = render(<TrainingComposer view={buildComposerView()} />);
    expect(screen.queryByTestId(TEST_IDS.trainingQuantityInput)).not.toBeInTheDocument();

    rerender(<TrainingComposer view={buildComposerView({ showsQuantity: true })} />);
    expect(screen.getByTestId(TEST_IDS.trainingQuantityInput)).toBeInTheDocument();
  });

  it('shows the duration hint and the validation message when there is one', () => {
    render(
      <TrainingComposer
        view={buildComposerView({
          durationHint: 'Between 20 and 180 minutes.',
          validationMessage: 'Pick the date you trained.',
        })}
      />,
    );

    expect(screen.getByText('Between 20 and 180 minutes.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Pick the date you trained.');
  });
});

describe('TrainingEvidenceEditor', () => {
  it('states that the file itself never leaves the upload service', () => {
    render(<TrainingEvidenceEditor view={buildEvidenceEditorView()} />);

    expect(screen.getByTestId(TEST_IDS.trainingEvidencePanel)).toHaveTextContent(
      'Only the reference is stored here.',
    );
    expect(screen.getByText('No evidence attached yet.')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.trainingEvidenceAdd)).toBeInTheDocument();
  });

  it('lists each collected metadata row with its optional description', () => {
    render(
      <TrainingEvidenceEditor
        view={buildEvidenceEditorView({
          canAdd: true,
          items: [
            { key: 'link-0', kindLabel: 'Link', reference: 'https://a.test', description: 'why' },
            { key: 'note-1', kindLabel: 'Note', reference: 'ref', description: null },
          ],
        })}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.trainingEvidenceItem)).toHaveLength(2);
    expect(screen.getByText('why')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.trainingEvidenceReference)).toBeInTheDocument();
  });
});

describe('TrainingBuddyEditor', () => {
  it('reports an empty buddy list plainly', () => {
    render(<TrainingBuddyEditor view={buildBuddyEditorView()} />);

    expect(screen.getByText('No buddies on this session.')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.trainingBuddyAdd)).toBeInTheDocument();
  });

  it('lists each named buddy with a way to remove them', () => {
    render(
      <TrainingBuddyEditor
        view={buildBuddyEditorView({ canAdd: true, selected: [{ value: 'm-2', label: 'Sara' }] })}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.trainingBuddyItem)).toHaveLength(1);
    expect(screen.getAllByText('Sara').length).toBeGreaterThan(0);
  });
});

describe('composer interaction', () => {
  it('drives every evidence control it renders', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    const onDescriptionChange = vi.fn();
    render(
      <TrainingEvidenceEditor
        view={buildEvidenceEditorView({
          canAdd: true,
          onAdd,
          onRemove,
          onDescriptionChange,
          items: [{ key: 'link-0', kindLabel: 'Link', reference: 'ref', description: null }],
        })}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.trainingEvidenceAdd));
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingEvidenceRemove));
    fireEvent(
      screen.getByTestId(TEST_IDS.trainingEvidenceDescription),
      new CustomEvent('ionInput', { detail: { value: 'note' } }),
    );

    expect(onAdd).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalledWith('link-0');
    expect(onDescriptionChange).toHaveBeenCalledWith('note');
  });

  it('drives every buddy control it renders', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(
      <TrainingBuddyEditor
        view={buildBuddyEditorView({
          canAdd: true,
          onAdd,
          onRemove,
          selected: [{ value: 'm-2', label: 'Sara' }],
        })}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.trainingBuddyAdd));
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingBuddyRemove));

    expect(onAdd).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalledWith('m-2');
  });

  it('drives the composer notes, type, and save controls', () => {
    const onNotesChange = vi.fn();
    const onSave = vi.fn();
    const onTypeChange = vi.fn();
    render(
      <TrainingComposer
        view={buildComposerView({ canSave: true, onNotesChange, onSave, onTypeChange })}
      />,
    );

    fireEvent(
      screen.getByTestId(TEST_IDS.trainingNotesInput),
      new CustomEvent('ionInput', { detail: { value: 'Tempo run.' } }),
    );
    fireEvent(
      screen.getByTestId(TEST_IDS.trainingNotesInput),
      new CustomEvent('ionInput', { detail: {} }),
    );
    fireEvent(
      screen.getByTestId(TEST_IDS.trainingTypeSelect),
      new CustomEvent('ionChange', { detail: { value: 'type-gym' } }),
    );
    fireEvent.click(screen.getByTestId(TEST_IDS.trainingSaveDraft));

    expect(onNotesChange).toHaveBeenCalledWith('Tempo run.');
    expect(onNotesChange).toHaveBeenCalledWith('');
    expect(onTypeChange).toHaveBeenCalledWith('type-gym');
    expect(onSave).toHaveBeenCalled();
  });
});
