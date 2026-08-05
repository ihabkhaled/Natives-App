import { vi } from 'vitest';

import type { DrillsCatalogueScreenView } from '@/modules/drills';

/** A ready catalogue screen: two drills, one active and one archived. */
export function buildDrillsCatalogueScreenView(
  overrides: Partial<DrillsCatalogueScreenView> = {},
): DrillsCatalogueScreenView {
  return {
    status: 'ready',
    loadingLabel: 'Loading drills…',
    errorTitle: 'Drills unavailable',
    errorMessage: 'Could not be read.',
    retryLabel: 'Retry',
    onRetry: vi.fn(),
    offlineTitle: 'Offline',
    offlineMessage: 'Reconnect to load drills.',
    offlineNoticeLabel: 'Reconnect to load drills.',
    isOffline: false,
    forbiddenTitle: 'Not available',
    forbiddenMessage: 'You do not have access.',
    emptyTitle: 'No drills yet',
    emptyMessage: 'Write your first drill.',
    title: 'Drills',
    subtitle: "The team's reusable drill library.",
    countLabel: 'Showing 2 of 2',
    searchLabel: 'Search',
    searchPlaceholder: 'Search by name, objective, or tag',
    search: '',
    onSearchChange: vi.fn(),
    categoryFilterLabel: 'Category',
    categoryFilter: 'all',
    categoryOptions: [
      { value: 'all', label: 'All' },
      { value: 'throwing', label: 'Throwing' },
    ],
    onCategoryFilterChange: vi.fn(),
    statusFilterLabel: 'Status',
    statusFilter: 'all',
    statusOptions: [
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ],
    onStatusFilterChange: vi.fn(),
    newDrillLabel: 'New drill',
    onNewDrill: vi.fn(),
    items: [
      {
        id: 'd1',
        name: 'Give-and-go break',
        categoryLabel: 'Throwing',
        intensityLabel: 'Moderate',
        durationLabel: '15 min',
        statusLabel: 'Active',
        statusTone: 'success',
        tagsSummary: 'throwing, footwork',
        ariaLabel: 'Give-and-go break',
      },
      {
        id: 'd2',
        name: 'Zone breakdown',
        categoryLabel: 'Defense',
        intensityLabel: 'Low',
        durationLabel: 'No default duration',
        statusLabel: 'Archived',
        statusTone: 'medium',
        tagsSummary: 'defense',
        ariaLabel: 'Zone breakdown',
      },
    ],
    hasMatches: true,
    noMatchesTitle: 'No drills match',
    noMatchesMessage: 'Try a different search.',
    onOpen: vi.fn(),
    ...overrides,
  };
}
