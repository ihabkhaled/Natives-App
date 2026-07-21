import type { SelectFieldOption, AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/** Scope, grants, and connectivity every notification screen resolves. */
export interface NotificationsContextView {
  readonly teamName: string;
  readonly isOffline: boolean;
  readonly canReadDeliveryFailures: boolean;
  readonly isLoading: boolean;
}

export interface NotificationRowView {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly categoryLabel: string;
  readonly categoryTone: string;
  readonly receivedLabel: string;
  readonly deliveryLabel: string;
  readonly deliveryTone: string;
  readonly readLabel: string | null;
  readonly isUnread: boolean;
  readonly openLabel: string;
  readonly canOpen: boolean;
  readonly markReadLabel: string;
}

interface NotificationGroupView {
  readonly key: string;
  readonly heading: string;
  readonly rows: readonly NotificationRowView[];
}

export interface NotificationsInboxView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly unreadLabel: string;
  readonly markAllReadLabel: string;
  readonly canMarkAll: boolean;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly SelectFieldOption[];
  readonly categoryFilterLabel: string;
  readonly categoryFilter: string;
  readonly categoryOptions: readonly SelectFieldOption[];
  readonly countLabel: string;
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly groups: readonly NotificationGroupView[];
  readonly boundedNotice: string;
  readonly canLoadMore: boolean;
  readonly loadMoreLabel: string;
  readonly deliveryNotice: string;
  readonly deliveryLinkLabel: string | null;
  readonly preferencesLinkLabel: string;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onCategoryFilterChange: (value: string) => void;
  readonly onOpen: (notificationId: string) => void;
  readonly onMarkRead: (notificationId: string) => void;
  readonly onMarkAllRead: () => void;
  readonly onLoadMore: () => void;
  readonly onOpenDeliveryCentre: () => void;
  readonly onOpenPreferences: () => void;
}

interface PreferenceCellView {
  readonly key: string;
  readonly channelLabel: string;
  readonly enabled: boolean;
  readonly locked: boolean;
  readonly onToggle: () => void;
}

export interface PreferenceRowView {
  readonly key: string;
  readonly categoryLabel: string;
  readonly mandatoryLabel: string | null;
  readonly cells: readonly PreferenceCellView[];
}

/** The quiet-hours form draft: null means "not edited, use the server value". */
export interface QuietHoursDraft {
  readonly startsLocal: string | null;
  readonly endsLocal: string | null;
  readonly urgent: boolean | null;
}

export interface QuietHoursView {
  readonly heading: string;
  readonly intro: string;
  readonly startLabel: string;
  readonly startValue: string;
  readonly endLabel: string;
  readonly endValue: string;
  readonly timezoneLabel: string;
  readonly timezoneValue: string;
  readonly urgentLabel: string;
  readonly urgentNote: string;
  readonly urgentEnabled: boolean;
  readonly validationMessage: string | null;
  readonly saveLabel: string;
  readonly isSaving: boolean;
  readonly onStartChange: (value: string) => void;
  readonly onEndChange: (value: string) => void;
  readonly onUrgentChange: (value: boolean) => void;
  readonly onSave: () => void;
}

export interface NotificationPreferencesView extends ScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly matrixHeading: string;
  readonly matrixIntro: string;
  readonly mandatoryNotice: string;
  readonly rows: readonly PreferenceRowView[];
  readonly scopeHeading: string;
  readonly scopeNote: string;
  readonly quietHours: QuietHoursView;
  readonly backLabel: string;
  readonly onBack: () => void;
}

/**
 * The deep-link arrival screen. It holds no target content at all: only the
 * outcome of the authorization re-check and a way back.
 */
export interface NotificationLinkView extends ScreenCopy {
  readonly title: string;
  readonly status: AsyncViewStatus;
  /** Non-null only once the arrival check passed; the container redirects. */
  readonly redirectPath: string | null;
  readonly resolvingLabel: string;
  readonly noPreviewNotice: string;
  readonly backLabel: string;
  readonly onBack: () => void;
}
