import { useAppTranslation } from '@/packages/i18n';
import { APP_ERROR_CODE, toAppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import type { DrillMutationView } from '../mutations/drills-mutations.types';
import { useArchiveDrillMutation } from '../mutations/use-archive-drill-mutation.hook';
import { useCreateDrillMutation } from '../mutations/use-create-drill-mutation.hook';
import { useUpdateDrillMutation } from '../mutations/use-update-drill-mutation.hook';
import type {
  ArchiveDrillCommand,
  CreateDrillCommand,
  Drill,
  UpdateDrillCommand,
} from '../types/drills.types';

const KEYS = I18N_KEYS.drills;

export interface DrillWriteMutations {
  readonly create: DrillMutationView<CreateDrillCommand>;
  readonly update: DrillMutationView<UpdateDrillCommand>;
  readonly archive: DrillMutationView<ArchiveDrillCommand>;
}

export interface UseDrillWriteMutationsOptions {
  readonly teamId: string;
  /** A freshly created drill's id is where the screen navigates next. */
  readonly onCreated: (drill: Drill) => void;
  /** A stale edit lost the race; the caller re-reads before the coach retries. */
  readonly onConflict: () => void;
}

/**
 * The three writes a drill screen can run, each already wired to its own
 * toast and, for an edit, to the version-conflict recovery a stale save needs.
 */
export function useDrillWriteMutations(
  options: UseDrillWriteMutationsOptions,
): DrillWriteMutations {
  const { t } = useAppTranslation();
  const { showToast } = useAppToast();
  const notify = (key: string): void => {
    void showToast({ message: t(key) });
  };

  const create = useCreateDrillMutation(options.teamId, {
    onSuccess: (drill) => {
      notify(KEYS.createdToast);
      options.onCreated(drill);
    },
    onError: () => {
      notify(KEYS.saveErrorToast);
    },
  });

  const update = useUpdateDrillMutation(options.teamId, {
    onSuccess: () => {
      notify(KEYS.savedToast);
    },
    onError: (error) => {
      const isConflict = toAppError(error).code === APP_ERROR_CODE.Conflict;
      notify(isConflict ? KEYS.saveConflictToast : KEYS.saveErrorToast);
      if (isConflict) {
        options.onConflict();
      }
    },
  });

  const archive = useArchiveDrillMutation(options.teamId, {
    onSuccess: () => {
      notify(KEYS.archivedToast);
    },
    onError: () => {
      notify(KEYS.archiveErrorToast);
    },
  });

  return { create, update, archive };
}
