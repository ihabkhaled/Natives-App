export interface AuthPanelProps {
  /** Page test id applied to the routed IonPage. */
  readonly testId: string;
  /** Visible screen heading and document title. */
  readonly title: string;
  /** Accessible label for the brand logo. */
  readonly logoLabel: string;
  /** id wired to the panel's aria-labelledby and the heading. */
  readonly headingId: string;
  /** Panel body: form, status, or confirmation content. */
  readonly children: React.ReactNode;
}
