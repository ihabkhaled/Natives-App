import { requestCreateJerseyOrder } from '../gateways/jersey.gateway';
import type { CreateJerseyOrderCommand, JerseyOrder } from '../types/jersey.types';

/** Opens a draft order. A draft commits the team to nothing until submitted. */
export function createJerseyOrder(command: CreateJerseyOrderCommand): Promise<JerseyOrder> {
  return requestCreateJerseyOrder(command);
}
