import { describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE, AppError } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { buildSeason, buildTeam } from '../../../../tests/factories/teams.factory';
import { MATRIX_SCREEN_COPY, SEASONS_SCREEN_COPY, TEAMS_SCREEN_COPY } from './teams-copy.helper';
import {
  buildDatePickerCopy,
  buildField,
  buildSeasonEditorCopy,
  buildSeasonsCopy,
  buildTeamEditorCopy,
  buildTeamsCopy,
} from './teams-editor-view.helper';
import {
  resolveSeasonTransitionErrorKey,
  resolveTeamTransitionErrorKey,
} from './teams-error.helper';
import { buildSeasonRows, buildTeamRows } from './teams-rows.helper';

const t = (key: string): string => key;

const team = buildTeam;
const season = buildSeason;

describe('buildTeamRows', () => {
  const actions = { canManage: true, onEdit: vi.fn(), onTransition: vi.fn() };

  it('disambiguates two teams sharing a name by slug and timezone', () => {
    const [row] = buildTeamRows(t, [team()], actions);

    expect(row?.label).toBe('Ultimate Natives');
    expect(row?.detail).toBe('un · Africa/Cairo');
    expect(row?.tone).toBe('success');
  });

  it('offers only the moves that are legal from an active team', () => {
    const [row] = buildTeamRows(t, [team()], actions);

    expect(row?.transitions.map((entry) => entry.key)).toEqual(['deactivate', 'archive']);
  });

  it('offers reactivation and removal from archived, and nothing else', () => {
    const [row] = buildTeamRows(t, [team({ status: 'archived' })], actions);

    // `remove` is reachable only from archived; anywhere else it is a 409.
    expect(row?.transitions.map((entry) => entry.key)).toEqual(['activate', 'remove']);
  });

  it('reports the row and the chosen transition back to the caller', () => {
    const onEdit = vi.fn();
    const onTransition = vi.fn();
    const [row] = buildTeamRows(t, [team()], { canManage: true, onEdit, onTransition });

    row?.onEdit();
    row?.transitions[0]?.onSelect();

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'team-1' }));
    expect(onTransition).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'team-1' }),
      'deactivate',
    );
  });

  it('marks rows unmanageable for a reader', () => {
    const [row] = buildTeamRows(t, [team()], { ...actions, canManage: false });

    expect(row?.canManage).toBe(false);
  });
});

describe('buildSeasonRows', () => {
  const actions = { canManage: true, onEdit: vi.fn(), onTransition: vi.fn() };

  it('states the window and the lifecycle state', () => {
    const [row] = buildSeasonRows(t, [season()], actions);

    expect(row?.detail).toBe('2026-01-01 → 2026-12-31');
    expect(row?.value).toBe(I18N_KEYS.seasonsAdmin.statusDraft);
    expect(row?.tone).toBe('warning');
  });

  it('offers activate and archive from draft, and nothing at all from archived', () => {
    expect(buildSeasonRows(t, [season()], actions)[0]?.transitions.map((e) => e.key)).toEqual([
      'activate',
      'archive',
    ]);
    expect(buildSeasonRows(t, [season({ status: 'archived' })], actions)[0]?.transitions).toEqual(
      [],
    );
  });

  it('offers close from active', () => {
    expect(
      buildSeasonRows(t, [season({ status: 'active' })], actions)[0]?.transitions.map((e) => e.key),
    ).toEqual(['close', 'archive']);
  });

  it('reports the chosen transition', () => {
    const onTransition = vi.fn();
    const onEdit = vi.fn();
    const [row] = buildSeasonRows(t, [season()], { canManage: true, onEdit, onTransition });

    row?.onEdit();
    row?.transitions[0]?.onSelect();

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onTransition).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'season-1' }),
      'activate',
    );
  });
});

describe('teams screen copy key sets', () => {
  it('binds each screen to its own namespace', () => {
    expect(TEAMS_SCREEN_COPY.errorTitle).toBe(I18N_KEYS.teamsAdmin.errorTitle);
    expect(SEASONS_SCREEN_COPY.forbiddenTitle).toBe(I18N_KEYS.seasonsAdmin.forbiddenTitle);
    expect(MATRIX_SCREEN_COPY.errorMessage).toBe(I18N_KEYS.permissionsMatrix.errorMessage);
  });
});

describe('buildField', () => {
  it('hides the error until a submit has been attempted', () => {
    const field = buildField(t, {
      labelKey: 'label',
      value: '',
      onChange: vi.fn(),
      errorKey: 'boom',
      showError: false,
    });

    expect(field.error).toBeNull();
    expect(field.hint).toBeNull();
    expect(field.isReadOnly).toBe(false);
  });

  it('surfaces the error, the hint, and the read-only flag once asked to', () => {
    const field = buildField(t, {
      labelKey: 'label',
      value: 'v',
      onChange: vi.fn(),
      errorKey: 'boom',
      showError: true,
      hintKey: 'hint',
      isReadOnly: true,
    });

    expect(field).toMatchObject({ error: 'boom', hint: 'hint', isReadOnly: true, value: 'v' });
  });
});

describe('editor copy builders', () => {
  it('switches between create and edit wording', () => {
    expect(buildTeamEditorCopy(t, true, false).heading).toBe(I18N_KEYS.teamsAdmin.createHeading);
    expect(buildTeamEditorCopy(t, false, false).heading).toBe(I18N_KEYS.teamsAdmin.editHeading);
    expect(buildSeasonEditorCopy(t, true, false).intro).toBe(I18N_KEYS.seasonsAdmin.createIntro);
    expect(buildSeasonEditorCopy(t, false, false).intro).toBe(I18N_KEYS.seasonsAdmin.editIntro);
  });

  it('says "saving" while a save is in flight, whichever mode it is in', () => {
    expect(buildTeamEditorCopy(t, true, true).submitLabel).toBe(I18N_KEYS.teamsAdmin.savingLabel);
    expect(buildSeasonEditorCopy(t, false, true).submitLabel).toBe(
      I18N_KEYS.seasonsAdmin.savingLabel,
    );
  });

  it('names the create and save actions distinctly when idle', () => {
    expect(buildTeamEditorCopy(t, true, false).submitLabel).toBe(I18N_KEYS.teamsAdmin.createSubmit);
    expect(buildTeamEditorCopy(t, false, false).submitLabel).toBe(I18N_KEYS.teamsAdmin.saveSubmit);
    expect(buildSeasonEditorCopy(t, true, false).submitLabel).toBe(
      I18N_KEYS.seasonsAdmin.createSubmit,
    );
    expect(buildSeasonEditorCopy(t, false, false).submitLabel).toBe(
      I18N_KEYS.seasonsAdmin.saveSubmit,
    );
  });

  it('carries the shared date-picker copy into the season editor', () => {
    expect(buildSeasonEditorCopy(t, true, false)).toMatchObject(buildDatePickerCopy(t));
  });

  it('resolves each screen title once', () => {
    expect(buildTeamsCopy(t).title).toBe(I18N_KEYS.teamsAdmin.title);
    expect(buildSeasonsCopy(t).title).toBe(I18N_KEYS.seasonsAdmin.title);
  });
});

describe('lifecycle error resolution', () => {
  function appError(messageKey?: string): AppError {
    return new AppError({ code: APP_ERROR_CODE.Conflict, messageKey });
  }

  it('names the real reason an illegal team move was refused', () => {
    expect(resolveTeamTransitionErrorKey(appError('errors.teams.teamInvalidTransition'))).toBe(
      I18N_KEYS.teamsAdmin.transitionInvalidError,
    );
  });

  it('explains the one-active-season invariant rather than inviting a retry', () => {
    expect(resolveSeasonTransitionErrorKey(appError('errors.teams.seasonAlreadyActive'))).toBe(
      I18N_KEYS.seasonsAdmin.alreadyActiveError,
    );
  });

  it('names an illegal season move', () => {
    expect(resolveSeasonTransitionErrorKey(appError('errors.teams.seasonInvalidTransition'))).toBe(
      I18N_KEYS.seasonsAdmin.invalidTransitionError,
    );
  });

  it('falls back to the generic failure for an unmapped or non-AppError failure', () => {
    expect(resolveTeamTransitionErrorKey(appError('errors.other'))).toBe(
      I18N_KEYS.teamsAdmin.failedToast,
    );
    expect(resolveTeamTransitionErrorKey(appError())).toBe(I18N_KEYS.teamsAdmin.failedToast);
    expect(resolveSeasonTransitionErrorKey(new Error('boom'))).toBe(
      I18N_KEYS.seasonsAdmin.failedToast,
    );
  });
});
