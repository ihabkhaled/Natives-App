export interface StandingsScreenShellProps {
  /** Identifies the page for route-level assertions. */
  readonly pageTestId: string;
  /** Identifies the content region inside the page. */
  readonly viewTestId: string;
  /** Doubles as the page title and the region's accessible name. */
  readonly title: string;
  readonly subtitle: string;
  readonly children: React.ReactNode;
}
