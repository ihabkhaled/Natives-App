/**
 * Ionic presents confirmations in an overlay jsdom cannot drive. Tests stub
 * only the confirmation itself; the mutation, service, gateway, and MSW
 * handler underneath all run for real.
 */
export const confirmResult = { value: true };

export function withConfirmStub(actual: Record<string, unknown>): Record<string, unknown> {
  return {
    ...actual,
    useConfirmAlert: () => ({ confirm: () => Promise.resolve(confirmResult.value) }),
  };
}
