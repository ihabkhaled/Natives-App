import { useState } from 'react';

import { EMPTY_CREATE_GROUP_FORM } from '../constants/practice-agenda-groups.constants';
import type { CreateGroupFormState } from '../helpers/agenda-groups-view.helper';

export interface AgendaGroupsFormsView {
  readonly createForm: CreateGroupFormState;
  readonly setCreateField: (field: keyof CreateGroupFormState, value: string) => void;
  readonly resetCreateForm: () => void;
  readonly copySourceSessionId: string;
  readonly setCopySourceSessionId: (value: string) => void;
  readonly resetCopyForm: () => void;
  readonly addMemberValues: Readonly<Record<string, string>>;
  readonly setAddMemberValue: (groupId: string, value: string) => void;
  readonly resetAddMemberValue: (groupId: string) => void;
}

/**
 * The rest state of every form on the screen. Kept out of the screen hook so
 * that hook stays a composition of collaborators rather than a state pile —
 * `use-practice-agenda-actions.hook.ts` in the sibling module does the same
 * for its one field.
 *
 * `addMemberValues` is a record keyed by group id rather than one shared
 * field: a coach may have several groups open at once, and typing into one
 * must not clear what they typed into another.
 */
export function useAgendaGroupsForms(): AgendaGroupsFormsView {
  const [createForm, setCreateForm] = useState<CreateGroupFormState>(EMPTY_CREATE_GROUP_FORM);
  const [copySourceSessionId, setCopySourceSessionId] = useState('');
  const [addMemberValues, setAddMemberValues] = useState<Readonly<Record<string, string>>>({});

  return {
    createForm,
    setCreateField: (field, value) => {
      setCreateForm((current) => ({ ...current, [field]: value }));
    },
    resetCreateForm: () => {
      setCreateForm(EMPTY_CREATE_GROUP_FORM);
    },
    copySourceSessionId,
    setCopySourceSessionId,
    resetCopyForm: () => {
      setCopySourceSessionId('');
    },
    addMemberValues,
    setAddMemberValue: (groupId, value) => {
      setAddMemberValues((current) => ({ ...current, [groupId]: value }));
    },
    resetAddMemberValue: (groupId) => {
      setAddMemberValues((current) => ({ ...current, [groupId]: '' }));
    },
  };
}
