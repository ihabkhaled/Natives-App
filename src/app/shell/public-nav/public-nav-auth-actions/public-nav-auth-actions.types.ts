export interface PublicNavAuthActionsProps {
  readonly signInLabel: string;
  readonly onSignIn: () => void;
  readonly signUpLabel: string;
  readonly onSignUp: () => void;
  /** Drawer rendering: full-width buttons carrying the drawer test ids. */
  readonly inDrawer?: boolean;
}
