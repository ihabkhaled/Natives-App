import type { SessionRowView } from '../../hooks/use-sessions-screen.hook';

export interface SessionListProps {
  readonly rows: readonly SessionRowView[];
  readonly currentLabel: string;
  readonly revokeLabel: string;
  readonly revokeOthersLabel: string;
  readonly hasOtherSessions: boolean;
  readonly isRevoking: boolean;
  readonly onRevoke: (sessionId: string) => void;
  readonly onRevokeOthers: () => void;
}
