import { TEST_IDS } from '@/shared/config';
import { PageShell } from '@/shared/ui';

import { NotFoundView } from '../components/not-found-view';
import { useNotFoundScreen } from '../hooks/use-not-found-screen.hook';

export function NotFoundContainer(): React.JSX.Element {
  const screen = useNotFoundScreen();
  return (
    <PageShell title={screen.title} testId={TEST_IDS.notFoundPage}>
      <NotFoundView
        title={screen.title}
        message={screen.message}
        goHomeLabel={screen.goHomeLabel}
        onGoHome={screen.onGoHome}
      />
    </PageShell>
  );
}
