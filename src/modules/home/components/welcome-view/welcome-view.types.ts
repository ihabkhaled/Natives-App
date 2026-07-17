export interface WelcomeViewProps {
  readonly title: string;
  readonly subtitle: string;
  readonly loginCta: string;
  readonly onLoginClick: () => void;
}
