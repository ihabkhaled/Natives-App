/** One station of the resolved plan: its own words, plus the group it resolves to. */
export interface ResolvedStationView {
  readonly id: string;
  readonly name: string;
  readonly target: string | null;
  /** The owning group's name, or the "Unassigned" copy when `groupId` is null. */
  readonly groupLabel: string;
}

/** One block of the resolved plan. Read-only: editing blocks belongs to `practice-agenda`. */
export interface ResolvedBlockView {
  readonly id: string;
  readonly title: string;
  readonly durationLabel: string | null;
  readonly stations: readonly ResolvedStationView[];
}

/** One assigned member, with the control that removes them. */
export interface GroupMemberRowView {
  readonly membershipId: string;
  readonly removeLabel: string;
  readonly isRemoving: boolean;
  readonly onRemove: () => void;
}

/** One group: its own fields, its members, and the form that adds another. */
export interface GroupRowView {
  readonly id: string;
  readonly name: string;
  readonly color: string | null;
  readonly notes: string | null;
  readonly members: readonly GroupMemberRowView[];
  readonly membersEmptyLabel: string;
  readonly addMemberLabel: string;
  readonly addMemberPlaceholder: string;
  readonly addMemberValue: string;
  readonly onAddMemberValueChange: (value: string) => void;
  readonly addMemberSubmitLabel: string;
  readonly canAddMember: boolean;
  readonly isAddingMember: boolean;
  readonly onAddMember: () => void;
  readonly removeGroupLabel: string;
  readonly isRemovingGroup: boolean;
  readonly onRemoveGroup: () => void;
}

/** The new-group form: every field controlled, nothing local to the component. */
export interface CreateGroupFormView {
  readonly heading: string;
  readonly nameLabel: string;
  readonly nameValue: string;
  readonly onNameChange: (value: string) => void;
  readonly colorLabel: string;
  readonly colorValue: string;
  readonly colorOptions: readonly { readonly value: string; readonly label: string }[];
  readonly onColorChange: (value: string) => void;
  readonly coachLabel: string;
  readonly coachValue: string;
  readonly onCoachChange: (value: string) => void;
  readonly notesLabel: string;
  readonly notesValue: string;
  readonly onNotesChange: (value: string) => void;
  readonly submitLabel: string;
  readonly canSubmit: boolean;
  readonly isSaving: boolean;
  readonly onSubmit: () => void;
}

/** The copy-from-another-session form. */
export interface CopyAgendaFormView {
  readonly heading: string;
  readonly sourceLabel: string;
  readonly sourceValue: string;
  readonly onSourceChange: (value: string) => void;
  readonly submitLabel: string;
  readonly canSubmit: boolean;
  readonly isCopying: boolean;
  readonly onSubmit: () => void;
}

/** Everything the groups-and-plan screen renders, ready to display. */
export interface PracticeAgendaGroupsScreenView {
  readonly title: string;
  readonly subtitle: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly errorTitle: string;
  readonly errorMessage: string;
  /** Empty until the plan has loaded far enough to know its status. */
  readonly statusLabel: string;
  readonly planHeading: string;
  readonly blocksEmptyLabel: string;
  readonly blocks: readonly ResolvedBlockView[];
  readonly groupsHeading: string;
  readonly groupsEmptyLabel: string;
  readonly groups: readonly GroupRowView[];
  readonly createForm: CreateGroupFormView;
  readonly copyForm: CopyAgendaFormView;
  /** The last command's outcome, or null before one has run. */
  readonly notice: string | null;
}
