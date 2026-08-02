import { schemaBuilder } from '@/packages/schema';

import { ACCOUNT_STATE } from '../types/auth.types';

/**
 * `POST /auth/signup` → 201 `{ message, state }` (backend
 * `SignupAcknowledgementResponseDto`). Deliberately token-free: signup never
 * starts a session, and `state` is `pending` until an administrator approves
 * the account. The enum is the full account-state vocabulary so a future
 * auto-approving deployment parses without a contract break.
 */
export const signupAcknowledgementSchema = schemaBuilder.object({
  message: schemaBuilder.string().min(1),
  state: schemaBuilder.enum([ACCOUNT_STATE.Active, ACCOUNT_STATE.Pending, ACCOUNT_STATE.Suspended]),
});
