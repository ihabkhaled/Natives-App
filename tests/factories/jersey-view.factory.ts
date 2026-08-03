import type { ActiveTeamScopeView, EffectivePermissionsView } from '@/modules/auth';
import type {
  JerseyOrderDetailView,
  JerseyOrderLineView,
  JerseyOrderRowView,
  JerseyScreenView,
} from '@/modules/jersey/types/jersey-view.types';

/** One openable order row, mid-lifecycle. */
export function buildJerseyOrderRowView(
  overrides: Partial<JerseyOrderRowView> = {},
): JerseyOrderRowView {
  return {
    id: 'order-1',
    reference: 'UN-2026-HOME',
    statusLabel: 'ordered',
    statusTone: 'warning',
    supplier: 'Kitmaker Cairo',
    placedLabel: '1 August 2026',
    canOpen: true,
    isOpen: false,
    ...overrides,
  };
}

/** One personalized packing-list line. */
export function buildJerseyOrderLineView(
  overrides: Partial<JerseyOrderLineView> = {},
): JerseyOrderLineView {
  return {
    id: '0',
    productName: 'Home jersey 2026',
    kitLabel: 'home',
    sizeLabel: 'M',
    sleevesLabel: 'short',
    quantityLabel: '×1',
    personalization: '#7 · ADEL',
    ...overrides,
  };
}

/** An opened order whose packing list has already resolved. */
export function buildJerseyDetailView(
  overrides: Partial<JerseyOrderDetailView> = {},
): JerseyOrderDetailView {
  return {
    orderId: 'order-1',
    reference: 'UN-2026-HOME',
    statusLabel: 'ordered',
    statusTone: 'warning',
    isLoading: false,
    loadingLabel: 'Loading…',
    lines: [buildJerseyOrderLineView()],
    ...overrides,
  };
}

/** The whole screen view model, ready with one row and nothing opened. */
export function buildJerseyScreenView(overrides: Partial<JerseyScreenView> = {}): JerseyScreenView {
  return {
    path: '/jersey-orders',
    pageTitle: 'Jersey orders',
    subtitle: 'Stock, products and the supplier orders that restock them.',
    status: 'ready',
    listHeading: 'Orders',
    listIntro: 'Newest first.',
    countLabel: '3 orders',
    notice: null,
    rows: [buildJerseyOrderRowView()],
    onToggleOrder: (): void => undefined,
    detail: null,
    loadingLabel: 'Loading jersey orders…',
    errorTitle: 'Something went wrong',
    errorMessage: 'Something went wrong',
    retryLabel: 'Try again',
    onRetry: (): void => undefined,
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to load the latest data.',
    offlineNoticeLabel: 'Reconnect to load the latest data.',
    isOffline: false,
    forbiddenTitle: 'Permission needed',
    forbiddenMessage: 'Grant the required permission to use this feature.',
    emptyTitle: 'No jersey orders yet',
    emptyMessage: 'Orders appear here once someone places one with a supplier.',
    ...overrides,
  };
}

/** The active team scope the jersey hooks read, with the season already set. */
export function buildJerseyTeamScope(
  overrides: Partial<ActiveTeamScopeView> = {},
): ActiveTeamScopeView {
  return {
    teamId: 'team-1',
    membershipId: 'membership-1',
    seasonId: 'season-1',
    teamName: 'Cairo Natives',
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

/** The effective grants the jersey hooks read. */
export function buildJerseyGrants(
  permissions: readonly string[],
  overrides: Partial<EffectivePermissionsView> = {},
): EffectivePermissionsView {
  return {
    permissions,
    accountActive: true,
    accountPending: false,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
    ...overrides,
  };
}
