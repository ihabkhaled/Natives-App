import type { ComposerFormState } from '../constants/training-form.constants';
import type { ComposerCallbacks } from '../types/training-view.types';
import type { SubmissionDraft } from '../types/training.types';
import { toSubmissionDraft } from './submission-draft.helper';

/** Everything the composer's callbacks need, injected rather than captured. */
export interface ComposerCallbackDeps {
  readonly form: ComposerFormState;
  readonly validationKey: string | null;
  readonly datePicker: {
    readonly open: () => void;
    readonly dismiss: () => void;
    readonly choose: (value: string, commit: (value: string) => void) => void;
  };
  readonly patch: (changes: Partial<ComposerFormState>) => void;
  readonly reset: () => void;
  readonly onSave: (draft: SubmissionDraft) => void;
}

/**
 * The composer's field callbacks as one pure table. Keeping them out of the
 * hook keeps the hook readable and makes each edit path directly testable.
 * Save is deliberately a no-op while the form is invalid: the button is also
 * disabled, but the guard here is what makes a stray call harmless.
 */
export function buildComposerCallbacks(deps: ComposerCallbackDeps): ComposerCallbacks {
  return {
    onTypeChange: (activityTypeId) => {
      deps.patch({ activityTypeId });
    },
    // Choosing a day commits and closes in one gesture; there is no second
    // "confirm" step to forget.
    onDateChange: (value) => {
      deps.datePicker.choose(value, (performedOn) => {
        deps.patch({ performedOn });
      });
    },
    onDateOpen: deps.datePicker.open,
    onDateDismiss: deps.datePicker.dismiss,
    onDurationChange: (duration) => {
      deps.patch({ duration });
    },
    onQuantityChange: (quantity) => {
      deps.patch({ quantity });
    },
    onNotesChange: (notes) => {
      deps.patch({ notes });
    },
    onSave: () => {
      if (deps.validationKey === null) {
        deps.onSave(toSubmissionDraft(deps.form));
        deps.reset();
      }
    },
  };
}
