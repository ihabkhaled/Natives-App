/** Stable, team-scoped query-key builders for the jersey cache. */
export const jerseyQueryKeys = {
  all: ['jersey'] as const,
  team: (teamId: string) => [...jerseyQueryKeys.all, 'team', teamId] as const,
  orders: (teamId: string, offset: number) =>
    [...jerseyQueryKeys.team(teamId), 'orders', offset] as const,
  order: (teamId: string, orderId: string) =>
    [...jerseyQueryKeys.team(teamId), 'order', orderId] as const,
  /**
   * Kept on its own branch rather than under `order`, so refreshing an order's
   * record never silently re-fetches the personal data in its packing list.
   */
  supplierExport: (teamId: string, orderId: string) =>
    [...jerseyQueryKeys.team(teamId), 'supplier-export', orderId] as const,
};
