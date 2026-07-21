import { useAppTranslation } from '@/packages/i18n';
import { useInvalidatingMutation } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { SEASON_STATUS_LABEL_KEYS, SEASON_STATUSES } from '../constants/teams.constants';
import { buildField, buildSeasonEditorCopy } from '../helpers/teams-editor-view.helper';
import { isSeasonFormValid, validateSeasonForm } from '../helpers/teams-form.helper';
import { teamsQueryKeys } from '../queries/teams.keys';
import { createSeason } from '../services/create-season.service';
import { updateSeason } from '../services/update-season.service';
import type { Season } from '../types/teams.types';
import type { SeasonEditorView } from '../types/teams-view.types';
import { useSeasonDateFields } from './use-season-date-fields.hook';
import type { SeasonFormState } from './use-season-form-state.hook';

/**
 * The create/edit season form.
 *
 * Lifecycle moves live on the list rows, not here: the backend exposes them as
 * their own verbs so it can refuse an illegal move, and this form only edits
 * the season's own facts.
 */
export function useSeasonEditor(
  teamId: string,
  form: SeasonFormState,
  canManage: boolean,
): SeasonEditorView | null {
  const { t } = useAppTranslation();
  const { showToast } = useAppToast();
  const isCreate = form.editing === null;
  const errors = validateSeasonForm(form.slug, form.name, form.startsOn, form.endsOn);
  const dates = useSeasonDateFields(
    t,
    form,
    {
      startsOnKey: I18N_KEYS.seasonsAdmin.startsOnLabel,
      endsOnKey: I18N_KEYS.seasonsAdmin.endsOnLabel,
    },
    errors,
  );
  const save = useInvalidatingMutation<Season, undefined>({
    mutationFn: () => {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        startsOn: form.startsOn,
        endsOn: form.endsOn,
        status: form.status,
      };
      return form.editing === null
        ? createSeason(teamId, payload)
        : updateSeason(teamId, form.editing.id, {
            ...payload,
            expectedVersion: form.editing.version,
          });
    },
    invalidateKey: teamsQueryKeys.seasons(teamId),
    onSuccess: () => {
      void showToast({
        message: t(
          isCreate ? I18N_KEYS.seasonsAdmin.createdToast : I18N_KEYS.seasonsAdmin.savedToast,
        ),
        tone: 'success',
      });
      form.close();
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.seasonsAdmin.failedToast), tone: 'danger' });
    },
  });
  if (!canManage || !form.isOpen) {
    return null;
  }
  return {
    ...buildSeasonEditorCopy(t, isCreate, save.isRunning),
    isOpen: true,
    slug: buildField(t, {
      labelKey: I18N_KEYS.seasonsAdmin.slugLabel,
      value: form.slug,
      onChange: form.setSlug,
      errorKey: errors.slug,
      showError: form.isSubmitted,
      hintKey: I18N_KEYS.seasonsAdmin.slugHint,
    }),
    name: buildField(t, {
      labelKey: I18N_KEYS.seasonsAdmin.nameLabel,
      value: form.name,
      onChange: form.setName,
      errorKey: errors.name,
      showError: form.isSubmitted,
    }),
    startsOn: dates.startsOn,
    endsOn: dates.endsOn,
    statusValue: form.status,
    statusOptions: SEASON_STATUSES.map((status) => ({
      value: status,
      label: t(SEASON_STATUS_LABEL_KEYS[status]),
    })),
    onStatusChange: (value) => {
      form.setStatus(SEASON_STATUSES.find((status) => status === value) ?? form.status);
    },
    isSaving: save.isRunning,
    onSubmit: () => {
      form.markSubmitted();
      if (isSeasonFormValid(errors)) {
        save.run(undefined);
      }
    },
    onCancel: form.close,
  };
}
