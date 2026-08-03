import { requestAddJerseyOrderItem } from '../gateways/jersey.gateway';
import type { AddJerseyOrderItemCommand, JerseyOrderItem } from '../types/jersey.types';

/**
 * Adds one line to a draft order. There is no route that removes a line, so
 * this is one-way: any UI built on it must say so before it is used.
 */
export function addJerseyOrderItem(command: AddJerseyOrderItemCommand): Promise<JerseyOrderItem> {
  return requestAddJerseyOrderItem(command);
}
