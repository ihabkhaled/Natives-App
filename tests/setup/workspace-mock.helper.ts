import { vi } from 'vitest';

/**
 * The toast and confirm doubles every lifecycle-screen test needs.
 *
 * A `vi.mock` factory is hoisted above the imports, so it cannot close over a
 * top-level binding — but it CAN dynamically import this module. Loading the
 * surface from here keeps the two workspace suites from carrying identical
 * copies of the same preamble.
 */
export const showToast = vi.fn();
export const confirm = vi.fn();

/** The `@/shared/ui` surface a workspace test replaces, around the real one. */
export async function loadWorkspaceUiMock(): Promise<Record<string, unknown>> {
  const actual = await vi.importActual<Record<string, unknown>>('@/shared/ui');
  return {
    ...actual,
    useAppToast: () => ({ showToast }),
    useConfirmAlert: () => ({ confirm }),
  };
}

/** Reset both doubles to their happy path: toast resolves, confirm accepts. */
export function resetWorkspaceUiSpies(): void {
  showToast.mockResolvedValue(undefined);
  confirm.mockResolvedValue(true);
}
