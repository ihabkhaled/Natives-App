import { useState } from 'react';

import type { MemberDirectoryItem } from '@/modules/members';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  blankAchievementDraft,
  buildAchievementFormView,
  isAchievementDraftValid,
  toCreateAchievementCommand,
  type AchievementDraft,
} from '../helpers/achievement-form-view.helper';
import { resolveStandingsWriteErrorKey } from '../helpers/to-standings-error.helper';
import { useCreateAchievementMutation } from '../mutations/use-create-achievement-mutation.hook';
import type { AchievementFormView } from '../types/achievements-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

interface CreateHookInput {
  readonly teamId: string;
  readonly locale: string;
  readonly isOffline: boolean;
  readonly members: readonly MemberDirectoryItem[];
  readonly onBanner: (message: string) => void;
}

export interface AchievementCreateApi {
  readonly form: AchievementFormView | null;
  readonly openCreate: () => void;
}

/** The draft-claim authoring concern, owned as a sub-hook. */
export function useAchievementCreate(t: Translate, input: CreateHookInput): AchievementCreateApi {
  const [isOpen, setOpen] = useState(false);
  const [draft, setDraft] = useState<AchievementDraft>(blankAchievementDraft);
  const [error, setError] = useState<string | null>(null);
  const [isDateOpen, setDateOpen] = useState(false);

  const create = useCreateAchievementMutation(input.teamId, {
    onSuccess: () => {
      setOpen(false);
      setDraft(blankAchievementDraft());
      input.onBanner(t(I18N_KEYS.standings.createSaved));
    },
    onError: (mutationError) => {
      setError(t(resolveStandingsWriteErrorKey(mutationError, I18N_KEYS.standings.createFailed)));
    },
  });

  const form = !isOpen
    ? null
    : buildAchievementFormView(t, {
        draft,
        members: input.members,
        locale: input.locale,
        isDateOpen,
        validationMessage: error,
        canSubmit: isAchievementDraftValid(draft) && !input.isOffline && !create.isRunning,
        isSaving: create.isRunning,
        patch: (patch) => {
          setDraft((current) => ({ ...current, ...patch }));
        },
        onDateOpen: () => {
          setDateOpen(true);
        },
        onDateDismiss: () => {
          setDateOpen(false);
        },
        onSubmit: () => {
          create.run(toCreateAchievementCommand(draft));
        },
        onCancel: () => {
          setOpen(false);
        },
      });

  return {
    form,
    openCreate: () => {
      setError(null);
      setOpen(true);
    },
  };
}
