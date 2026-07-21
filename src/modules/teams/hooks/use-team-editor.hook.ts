import { useAppTranslation } from '@/packages/i18n';
import { useInvalidatingMutation } from '@/packages/query';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { buildField, buildTeamEditorCopy } from '../helpers/teams-editor-view.helper';
import { isTeamFormValid, normalizeOptional, validateTeamForm } from '../helpers/teams-form.helper';
import { teamsQueryKeys } from '../queries/teams.keys';
import { createTeam } from '../services/create-team.service';
import { updateTeam } from '../services/update-team.service';
import type { Team } from '../types/teams.types';
import type { TeamEditorView } from '../types/teams-view.types';
import type { TeamFormState } from './use-team-form-state.hook';

/**
 * The create/edit team form.
 *
 * The slug is only writable while creating: the backend treats it as the team's
 * permanent identity, so offering it as an editable field on an existing team
 * would promise something it cannot keep. Creating is platform-scoped
 * (`team.create`) while editing is team-scoped (`team.settings.manage`), so the
 * two capabilities are gated separately rather than lumped together.
 */
export function useTeamEditor(
  form: TeamFormState,
  canManage: boolean,
  canCreate: boolean,
): TeamEditorView | null {
  const { t } = useAppTranslation();
  const { showToast } = useAppToast();
  const isCreate = form.editing === null;
  const errors = validateTeamForm(form.slug, form.name, isCreate);
  const save = useInvalidatingMutation<Team, undefined>({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        timezone: normalizeOptional(form.timezone),
        locale: normalizeOptional(form.locale),
        primaryColor: normalizeOptional(form.color),
      };
      return form.editing === null
        ? createTeam({ ...payload, slug: form.slug.trim() })
        : updateTeam(form.editing.id, { ...payload, expectedVersion: form.editing.version });
    },
    invalidateKey: teamsQueryKeys.list(),
    onSuccess: () => {
      void showToast({
        message: t(isCreate ? I18N_KEYS.teamsAdmin.createdToast : I18N_KEYS.teamsAdmin.savedToast),
        tone: 'success',
      });
      form.close();
    },
    onError: () => {
      void showToast({ message: t(I18N_KEYS.teamsAdmin.failedToast), tone: 'danger' });
    },
  });
  if (!form.isOpen || (isCreate ? !canCreate : !canManage)) {
    return null;
  }
  return {
    ...buildTeamEditorCopy(t, isCreate, save.isRunning),
    isOpen: true,
    slug: buildField(t, {
      labelKey: I18N_KEYS.teamsAdmin.slugLabel,
      value: form.slug,
      onChange: form.setSlug,
      errorKey: errors.slug,
      showError: form.isSubmitted,
      hintKey: I18N_KEYS.teamsAdmin.slugHint,
      isReadOnly: !isCreate,
    }),
    name: buildField(t, {
      labelKey: I18N_KEYS.teamsAdmin.nameLabel,
      value: form.name,
      onChange: form.setName,
      errorKey: errors.name,
      showError: form.isSubmitted,
    }),
    timezone: buildField(t, {
      labelKey: I18N_KEYS.teamsAdmin.timezoneLabel,
      value: form.timezone,
      onChange: form.setTimezone,
      errorKey: null,
      showError: false,
    }),
    locale: buildField(t, {
      labelKey: I18N_KEYS.teamsAdmin.localeLabel,
      value: form.locale,
      onChange: form.setLocale,
      errorKey: null,
      showError: false,
    }),
    color: buildField(t, {
      labelKey: I18N_KEYS.teamsAdmin.colorLabel,
      value: form.color,
      onChange: form.setColor,
      errorKey: null,
      showError: false,
    }),
    isSaving: save.isRunning,
    onSubmit: () => {
      form.markSubmitted();
      if (isTeamFormValid(errors)) {
        save.run(undefined);
      }
    },
    onCancel: form.close,
  };
}
