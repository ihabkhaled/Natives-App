import { describe, expect, it, vi } from 'vitest';

import type { AppError } from '@/shared/errors';

import type { Drill } from '../types/drills.types';
import type { DrillFormView } from '../types/drills-view.types';
import { buildDrillDetailView, type DrillDetailViewInput } from './drill-detail-view.helper';

const t = vi.fn((key: string) => key);

function drill(overrides: Partial<Drill> = {}): Drill {
  return {
    seasonId: null,
    name: 'Give-and-go break',
    category: 'throwing',
    objective: null,
    instructions: null,
    equipment: [],
    intensity: 'moderate',
    defaultDurationMinutes: null,
    skillTags: [],
    safetyNotes: null,
    mediaUrl: null,
    status: 'active',
    version: 1,
    id: 'd1',
    ...overrides,
  };
}

const FORM: DrillFormView = {
  heading: 'Drill details',
  nameField: {
    label: 'Name',
    name: 'name',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  categoryField: { label: 'Category', value: '', options: [], onChange: vi.fn() },
  intensityField: { label: 'Intensity', value: '', options: [], onChange: vi.fn() },
  objectiveField: {
    label: 'Objective',
    name: 'objective',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  instructionsField: {
    label: 'Instructions',
    name: 'instructions',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  equipmentField: {
    label: 'Equipment',
    name: 'equipment',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  skillTagsField: {
    label: 'Skill tags',
    name: 'skillTags',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  durationField: {
    label: 'Duration',
    name: 'defaultDurationMinutes',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  safetyNotesField: {
    label: 'Safety notes',
    name: 'safetyNotes',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  mediaUrlField: {
    label: 'Media link',
    name: 'mediaUrl',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  },
  saveLabel: 'Save drill',
  isSubmitting: false,
  onSubmit: vi.fn(),
  cancelLabel: 'Cancel',
  onCancel: vi.fn(),
};

function buildInput(overrides: Partial<DrillDetailViewInput> = {}): DrillDetailViewInput {
  return {
    drill: null,
    isCreateMode: true,
    isContextLoading: false,
    isQueryLoading: false,
    queryError: null,
    isOffline: false,
    permitted: true,
    onRetry: vi.fn(),
    onBack: vi.fn(),
    form: FORM,
    isArchiving: false,
    onArchive: vi.fn(),
    ...overrides,
  };
}

describe('buildDrillDetailView', () => {
  it('is ready immediately in create mode, with no status chip and no lifecycle', () => {
    const view = buildDrillDetailView(t, buildInput());

    expect(view.status).toBe('ready');
    expect(view.heading).toBe('drills.newHeading');
    expect(view.statusLabel).toBeNull();
    expect(view.statusTone).toBeNull();
    expect(view.lifecycle.visible).toBe(false);
    expect(view.lifecycle.notice).toBeNull();
  });

  it('reports loading while the context or the read is still resolving', () => {
    expect(
      buildDrillDetailView(t, buildInput({ isCreateMode: false, isContextLoading: true })).status,
    ).toBe('loading');
    expect(
      buildDrillDetailView(t, buildInput({ isCreateMode: false, isQueryLoading: true })).status,
    ).toBe('loading');
  });

  it('never reports loading for a blank create-mode form, however the context is resolving', () => {
    expect(buildDrillDetailView(t, buildInput({ isContextLoading: true })).status).toBe('ready');
  });

  it('withholds the screen from a principal without the grant', () => {
    expect(buildDrillDetailView(t, buildInput({ permitted: false })).status).toBe('forbidden');
  });

  it('reports the error state for a failed read, and forwards retry', () => {
    const onRetry = vi.fn();
    const error = { code: 'SERVER_ERROR', message: 'x' } as unknown as AppError;
    const view = buildDrillDetailView(
      t,
      buildInput({ isCreateMode: false, queryError: error, onRetry }),
    );

    expect(view.status).toBe('error');
    view.onRetry();
    expect(onRetry).toHaveBeenCalled();
  });

  it('never reports an error for a blank create-mode form', () => {
    const error = { code: 'SERVER_ERROR', message: 'x' } as unknown as AppError;
    expect(buildDrillDetailView(t, buildInput({ queryError: error })).status).toBe('ready');
  });

  it("renders the active drill's own name, status chip, and an offered archive action", () => {
    const view = buildDrillDetailView(
      t,
      buildInput({ isCreateMode: false, drill: drill({ name: 'Give-and-go break' }) }),
    );

    expect(view.heading).toBe('Give-and-go break');
    expect(view.statusLabel).toBe('drills.statusActive');
    expect(view.statusTone).toBe('success');
    expect(view.lifecycle.visible).toBe(true);
    expect(view.lifecycle.notice).toBeNull();
  });

  it('replaces the archive control with a plain notice once a drill is archived', () => {
    const view = buildDrillDetailView(
      t,
      buildInput({ isCreateMode: false, drill: drill({ status: 'archived' }) }),
    );

    expect(view.statusLabel).toBe('drills.statusArchived');
    expect(view.statusTone).toBe('medium');
    expect(view.lifecycle.visible).toBe(false);
    expect(view.lifecycle.notice).toBe('drills.archivedNotice');
  });

  it('carries the form and the busy flag straight through', () => {
    const view = buildDrillDetailView(
      t,
      buildInput({ isCreateMode: false, drill: drill(), isArchiving: true }),
    );

    expect(view.form).toBe(FORM);
    expect(view.lifecycle.isBusy).toBe(true);
  });

  it('falls back to the generic detail title when there is no heading yet', () => {
    // Not reachable through normal use (a ready, non-create state always has a
    // drill), but the title fallback still needs to hold if that ever changes.
    const view = buildDrillDetailView(t, buildInput({ isCreateMode: false, drill: null }));

    expect(view.title).toBe('drills.detailTitle');
  });
});
