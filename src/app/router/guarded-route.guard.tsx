import { Redirect } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';
import { LoadingState, StatusView } from '@/shared/ui';

import { useRouteGuard } from './hooks/use-route-guard.hook';
import type { GuardedRouteProps } from './guarded-route.types';

/**
 * Session- and permission-aware route gate. All post-auth transitions live
 * here: modules never navigate across module boundaries themselves, and a
 * blocked route resolves to a redirect or a state — never the screen.
 */
export function GuardedRoute(props: GuardedRouteProps): React.JSX.Element {
  const instruction = useRouteGuard(props.definition);
  if (instruction.kind === 'loading') {
    return <LoadingState label={instruction.label} testId={TEST_IDS.globalLoading} />;
  }
  if (instruction.kind === 'redirect') {
    return <Redirect to={instruction.to} />;
  }
  if (instruction.kind === 'state') {
    return (
      <StatusView
        icon={instruction.icon}
        tone={instruction.tone}
        title={instruction.title}
        message={instruction.message}
        testId={instruction.testId}
      />
    );
  }
  const Screen = instruction.Screen;
  return <Screen />;
}
