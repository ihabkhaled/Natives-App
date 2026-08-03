/** One page of meetings or tasks; the board reviews the near term, not a history. */
export const GOVERNANCE_PAGE_SIZE = 25;

export const MEETING_STATUSES = ['scheduled', 'held', 'minuted', 'approved', 'cancelled'] as const;
export const MEETING_VISIBILITIES = ['public', 'team', 'staff', 'board'] as const;
export const MEETING_RECURRENCES = ['none', 'weekly', 'monthly', 'quarterly'] as const;

/** Task priorities, most urgent first — the order the board list presents them in. */
export const TASK_PRIORITIES = ['urgent', 'high', 'normal', 'low'] as const;
export const TASK_STATUSES = ['open', 'in_progress', 'blocked', 'completed', 'cancelled'] as const;

/** Statuses that mean the task no longer needs attention. */
export const TASK_CLOSED_STATUSES: readonly string[] = ['completed', 'cancelled'];
