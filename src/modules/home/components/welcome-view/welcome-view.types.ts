export interface WelcomeViewProps {
  readonly title: string;
  readonly subtitle: string;
  readonly tagline: string;
  readonly logoLabel: string;
  readonly loginCta: string;
  readonly onLoginClick: () => void;
}
