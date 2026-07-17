import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { WelcomeView } from '../components/welcome-view';
import { useWelcomeScreen } from '../hooks/use-welcome-screen.hook';

export function WelcomeContainer(): React.JSX.Element {
  const screen = useWelcomeScreen();
  return (
    <PageShell title={screen.title} testId={TEST_IDS.welcomePage}>
      <WelcomeView
        title={screen.title}
        subtitle={screen.subtitle}
        loginCta={screen.loginCta}
        onLoginClick={screen.onLoginClick}
      />
    </PageShell>
  );
}
