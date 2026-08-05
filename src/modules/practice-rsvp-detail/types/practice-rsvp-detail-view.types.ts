/** One roster row: a participant, translated, with its two per-row actions. */
export interface RsvpRosterRowView {
  readonly membershipId: string;
  readonly idLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly sourceLabel: string;
  readonly respondedAtLabel: string;
  readonly detailLabel: string;
  readonly waitlistedLabel: string | null;
  readonly overrideLabel: string;
  readonly historyLabel: string;
  readonly onOverride: () => void;
  readonly onViewHistory: () => void;
}

/** The privacy-safe planning counts, each already formatted with its number. */
export interface RsvpSummaryView {
  readonly headingLabel: string;
  readonly goingLabel: string;
  readonly maybeLabel: string;
  readonly notGoingLabel: string;
  readonly noResponseLabel: string;
  readonly waitlistedLabel: string;
  readonly capacityLabel: string;
  readonly spotsRemainingLabel: string;
}

/** One choice in a select field: a wire value plus its translated label. */
export interface RsvpFieldOption {
  readonly value: string;
  readonly label: string;
}

/**
 * The override form for one member. `status` and `reason` are the two
 * required fields the confirm step guards; the rest are optional and travel
 * only when non-empty.
 */
export interface RsvpOverridePanelView {
  readonly membershipId: string;
  readonly headingLabel: string;
  readonly statusLabel: string;
  readonly statusOptions: readonly RsvpFieldOption[];
  readonly status: string;
  readonly onStatusChange: (value: string) => void;
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reason: string;
  readonly reasonValidationMessage: string | null;
  readonly onReasonChange: (value: string) => void;
  readonly reasonCategoryLabel: string;
  readonly reasonCategoryOptions: readonly RsvpFieldOption[];
  readonly reasonCategory: string;
  readonly onReasonCategoryChange: (value: string) => void;
  readonly noteLabel: string;
  readonly note: string;
  readonly onNoteChange: (value: string) => void;
  readonly noteVisibilityLabel: string;
  readonly noteVisibilityOptions: readonly RsvpFieldOption[];
  readonly noteVisibility: string;
  readonly onNoteVisibilityChange: (value: string) => void;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

/** One entry in a member's revision trail, fully translated. */
export interface RsvpHistoryEntryView {
  readonly id: string;
  readonly transitionLabel: string;
  readonly occurredLabel: string;
  readonly attributionLabel: string;
  readonly reasonLabel: string | null;
  readonly noteLabel: string | null;
}

export interface RsvpHistoryPanelView {
  readonly membershipId: string;
  readonly headingLabel: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly emptyLabel: string;
  readonly items: readonly RsvpHistoryEntryView[];
  readonly closeLabel: string;
  readonly onClose: () => void;
}

/**
 * Only one detail panel is ever open for one roster: overriding a member and
 * reading another member's history are mutually exclusive, so the kind is
 * one union value rather than two independent booleans a component would
 * have to reconcile itself.
 */
export type RsvpDetailPanel =
  | { readonly kind: 'none' }
  | { readonly kind: 'override'; readonly panel: RsvpOverridePanelView }
  | { readonly kind: 'history'; readonly panel: RsvpHistoryPanelView };

/** Everything the RSVP-detail screen renders, ready to display. */
export interface RsvpDetailScreenView {
  readonly title: string;
  readonly subtitle: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly summary: RsvpSummaryView | null;
  readonly statusFilterLabel: string;
  readonly statusFilterOptions: readonly RsvpFieldOption[];
  readonly statusFilter: string;
  readonly onStatusFilterChange: (value: string) => void;
  readonly countLabel: string;
  readonly rows: readonly RsvpRosterRowView[];
  readonly emptyLabel: string;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly loadMoreLabel: string;
  readonly onLoadMore: () => void;
  readonly panel: RsvpDetailPanel;
}
