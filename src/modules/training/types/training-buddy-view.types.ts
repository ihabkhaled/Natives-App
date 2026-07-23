/** One buddy credit awaiting (or carrying) the caller's answer. */
interface BuddyCreditView {
  readonly id: string;
  readonly claimLabel: string;
  readonly dateLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly respondedLabel: string | null;
  readonly isPending: boolean;
  readonly isConfirming: boolean;
  readonly isDeclining: boolean;
}

/** The badge-counted buddy confirmations section of the training workspace. */
export interface BuddySectionView {
  readonly title: string;
  readonly intro: string;
  readonly countBadge: string | null;
  readonly emptyLabel: string;
  readonly unavailableMessage: string | null;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly confirmLabel: string;
  readonly declineLabel: string;
  readonly items: readonly BuddyCreditView[];
  readonly onConfirm: (buddyId: string) => void;
  readonly onDecline: (buddyId: string) => void;
}
