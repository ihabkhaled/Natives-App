import type { AsyncViewStatus, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

/**
 * One assignment as the list renders it.
 *
 * `confirmMessage` is the sentence the revoke confirmation shows before
 * anything is removed. It is built from the assignment's own facts — who,
 * which role, which scope — so an administrator can never confirm a
 * revocation without having read whose access is going away.
 */
export interface AssignmentRowView {
  readonly id: string;
  readonly roleLabel: string;
  readonly scopeLabel: string;
  readonly sinceLabel: string;
  readonly grantedByLabel: string;
  readonly confirmMessage: string;
  /** False for a platform-wide grant: those are revoked on the platform screen. */
  readonly canRevoke: boolean;
  readonly revokeLabel: string;
  readonly onRevoke: () => void;
}

/**
 * The grant form. `options` is the server's assignable-roles catalog verbatim,
 * so the form cannot offer a role the server would refuse.
 */
export interface GrantPanelView {
  readonly heading: string;
  readonly ceilingNotice: string;
  readonly roleLabel: string;
  readonly roleValue: string;
  readonly options: readonly SelectFieldOption[];
  readonly onRoleChange: (value: string) => void;
  /** Set when the actor's ceiling yields nothing they may pass on. */
  readonly emptyCatalogMessage: string | null;
  readonly submitLabel: string;
  readonly canSubmit: boolean;
  readonly isGranting: boolean;
  readonly onSubmit: () => void;
}

export interface RoleAssignmentsScreenView extends ScreenCopy {
  readonly path: string;
  readonly pageTitle: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly targetLabel: string;
  readonly targetPlaceholder: string;
  readonly targetValue: string;
  readonly onTargetChange: (value: string) => void;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly countLabel: string;
  readonly notice: string | null;
  readonly rows: readonly AssignmentRowView[];
  /** Null until a target user is named, and for a principal who may not grant. */
  readonly grant: GrantPanelView | null;
}
