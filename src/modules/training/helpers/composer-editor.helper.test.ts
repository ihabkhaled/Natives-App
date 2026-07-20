import { describe, expect, it, vi } from 'vitest';

import { EMPTY_COMPOSER_STATE, EMPTY_EVIDENCE_FORM } from '../constants/training-form.constants';
import {
  buildBuddyEditorView,
  buildEvidenceEditorView,
  evidenceRowKey,
} from './composer-editor.helper';

const t = (key: string): string => key;

const CALLBACKS = {
  onKindChange: vi.fn(),
  onReferenceChange: vi.fn(),
  onDescriptionChange: vi.fn(),
  onAdd: vi.fn(),
  onRemove: vi.fn(),
};

const BUDDY_CALLBACKS = {
  onValueChange: vi.fn(),
  onAdd: vi.fn(),
  onRemove: vi.fn(),
};

describe('evidenceRowKey', () => {
  it('derives a stable key from the kind and the row position', () => {
    expect(evidenceRowKey('link', 2)).toBe('link-2');
  });
});

describe('buildEvidenceEditorView', () => {
  it('blocks the add action while the reference is blank', () => {
    const view = buildEvidenceEditorView(t, EMPTY_COMPOSER_STATE, EMPTY_EVIDENCE_FORM, CALLBACKS);

    expect(view.canAdd).toBe(false);
    expect(view.items).toEqual([]);
    expect(view.kindOptions).toHaveLength(3);
  });

  it('enables the add action once a reference is present', () => {
    const view = buildEvidenceEditorView(
      t,
      EMPTY_COMPOSER_STATE,
      { ...EMPTY_EVIDENCE_FORM, reference: 'https://example.test' },
      CALLBACKS,
    );

    expect(view.canAdd).toBe(true);
  });

  it('lists each collected row with its translated kind', () => {
    const view = buildEvidenceEditorView(
      t,
      {
        ...EMPTY_COMPOSER_STATE,
        evidence: [{ kind: 'note', storageReference: 'ref', description: 'why' }],
      },
      EMPTY_EVIDENCE_FORM,
      CALLBACKS,
    );

    expect(view.items).toEqual([
      {
        key: 'note-0',
        kindLabel: 'training.evidenceKindNote',
        reference: 'ref',
        description: 'why',
      },
    ]);
  });
});

describe('buildBuddyEditorView', () => {
  const options = [
    { value: 'm-2', label: 'Sara' },
    { value: 'm-3', label: 'Omar' },
  ];

  it('offers every option and blocks the add action while nothing is picked', () => {
    const view = buildBuddyEditorView(t, EMPTY_COMPOSER_STATE, options, {
      value: '',
      callbacks: BUDDY_CALLBACKS,
    });

    expect(view.options).toHaveLength(2);
    expect(view.canAdd).toBe(false);
    expect(view.selected).toEqual([]);
  });

  it('removes an already-named buddy from the remaining options', () => {
    const view = buildBuddyEditorView(
      t,
      { ...EMPTY_COMPOSER_STATE, buddyMembershipIds: ['m-2'] },
      options,
      { value: 'm-3', callbacks: BUDDY_CALLBACKS },
    );

    expect(view.options.map((option) => option.value)).toEqual(['m-3']);
    expect(view.selected).toEqual([{ value: 'm-2', label: 'Sara' }]);
    expect(view.canAdd).toBe(true);
  });

  it('falls back to the membership id when no name is known', () => {
    const view = buildBuddyEditorView(
      t,
      { ...EMPTY_COMPOSER_STATE, buddyMembershipIds: ['m-9'] },
      options,
      { value: 'm-9', callbacks: BUDDY_CALLBACKS },
    );

    expect(view.selected).toEqual([{ value: 'm-9', label: 'm-9' }]);
    expect(view.canAdd).toBe(false);
  });
});
