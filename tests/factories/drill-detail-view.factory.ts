import { vi } from 'vitest';

import type { DrillDetailScreenView, DrillFormFieldView } from '@/modules/drills';

function textField(overrides: Partial<DrillFormFieldView> = {}): DrillFormFieldView {
  return {
    label: 'Field',
    name: 'field',
    value: '',
    placeholder: '',
    errorMessage: undefined,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ...overrides,
  };
}

/** A ready detail/edit screen for an existing, active drill. */
export function buildDrillDetailScreenView(
  overrides: Partial<DrillDetailScreenView> = {},
): DrillDetailScreenView {
  return {
    status: 'ready',
    loadingLabel: 'Loading drill…',
    errorTitle: 'Drill unavailable',
    errorMessage: 'Could not be read.',
    retryLabel: 'Retry',
    onRetry: vi.fn(),
    offlineTitle: 'Offline',
    offlineMessage: 'Reconnect to load this drill.',
    offlineNoticeLabel: 'Reconnect to load this drill.',
    isOffline: false,
    forbiddenTitle: 'Not available',
    forbiddenMessage: 'You do not have access.',
    emptyTitle: 'Not found',
    emptyMessage: 'This drill could not be found.',
    title: 'Give-and-go break',
    heading: 'Give-and-go break',
    backLabel: 'Back to drills',
    onBack: vi.fn(),
    statusLabel: 'Active',
    statusTone: 'success',
    lifecycle: {
      visible: true,
      notice: null,
      actionLabel: 'Archive drill',
      isBusy: false,
      onArchive: vi.fn(),
    },
    form: {
      heading: 'Drill details',
      nameField: textField({ label: 'Name', name: 'name', value: 'Give-and-go break' }),
      categoryField: {
        label: 'Category',
        value: 'throwing',
        options: [{ value: 'throwing', label: 'Throwing' }],
        onChange: vi.fn(),
      },
      intensityField: {
        label: 'Intensity',
        value: 'moderate',
        options: [{ value: 'moderate', label: 'Moderate' }],
        onChange: vi.fn(),
      },
      objectiveField: textField({ label: 'Objective', name: 'objective' }),
      instructionsField: textField({ label: 'Instructions', name: 'instructions' }),
      equipmentField: textField({ label: 'Equipment', name: 'equipment' }),
      skillTagsField: textField({ label: 'Skill tags', name: 'skillTags' }),
      durationField: textField({ label: 'Duration', name: 'defaultDurationMinutes' }),
      safetyNotesField: textField({ label: 'Safety notes', name: 'safetyNotes' }),
      mediaUrlField: textField({ label: 'Media link', name: 'mediaUrl' }),
      saveLabel: 'Save drill',
      isSubmitting: false,
      onSubmit: vi.fn(),
      cancelLabel: 'Cancel',
      onCancel: vi.fn(),
    },
    ...overrides,
  };
}
