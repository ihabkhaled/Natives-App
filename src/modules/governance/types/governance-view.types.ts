import type { AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

export interface MeetingCardView {
  readonly id: string;
  readonly title: string;
  readonly statusLabel: string;
  readonly visibilityLabel: string;
  readonly visibilityCaption: string;
  readonly scheduledLabel: string;
  readonly scheduledAt: string;
  readonly decisionsLabel: string;
  readonly decisions: readonly string[];
  /** Says whether the minutes are settled — a decision is quotable only then. */
  readonly minutesLabel: string;
  readonly isMinutesApproved: boolean;
}

export interface TaskCardView {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly priorityLabel: string;
  readonly statusLabel: string;
  readonly dueLabel: string;
  readonly dueDate: string | null;
  /** Present when the task waits on another; the board reads this before chasing it. */
  readonly blockedNotice: string | null;
  readonly isClosed: boolean;
}

export interface GovernanceScreenView extends ScreenCopy {
  readonly path: string;
  readonly pageTitle: string;
  readonly status: AsyncViewStatus;
  readonly meetingsHeading: string;
  readonly meetingsIntro: string;
  readonly meetingCountLabel: string;
  readonly meetings: readonly MeetingCardView[];
  readonly tasksHeading: string;
  readonly tasksIntro: string;
  readonly taskCountLabel: string;
  readonly tasks: readonly TaskCardView[];
}
