/** Jersey paths, relative to the versioned API base URL. */
function teamPath(teamId: string): string {
  return `/teams/${encodeURIComponent(teamId)}`;
}

export function jerseyProductsPath(teamId: string): string {
  return `${teamPath(teamId)}/jersey-products`;
}

export function jerseyInventoryPath(teamId: string): string {
  return `${teamPath(teamId)}/jersey-inventory`;
}

export function jerseyOrdersPath(teamId: string): string {
  return `${teamPath(teamId)}/jersey-orders`;
}

export function jerseyOrderPath(teamId: string, orderId: string): string {
  return `${jerseyOrdersPath(teamId)}/${encodeURIComponent(orderId)}`;
}

export function jerseyOrderItemsPath(teamId: string, orderId: string): string {
  return `${jerseyOrderPath(teamId, orderId)}/items`;
}

/**
 * The privacy-minimal packing list for one order. A read, but a privileged
 * one: it is the only route that returns members' printed names and numbers.
 */
export function jerseyOrderSupplierExportPath(teamId: string, orderId: string): string {
  return `${jerseyOrderPath(teamId, orderId)}/supplier-export`;
}
