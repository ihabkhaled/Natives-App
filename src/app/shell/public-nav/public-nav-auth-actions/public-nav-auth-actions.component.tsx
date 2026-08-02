import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { PublicNavAuthActionsProps } from './public-nav-auth-actions.types';

/**
 * The signed-out account pair: sign in, or request an account. Rendered twice
 * from one definition — inline in the navbar and full-width in the mobile
 * drawer — so the two surfaces can never drift apart in wording or order.
 */
export function PublicNavAuthActions(props: PublicNavAuthActionsProps): React.JSX.Element {
  const inDrawer = props.inDrawer === true;
  return (
    <>
      <AppButton
        label={props.signInLabel}
        tone={inDrawer ? 'secondary' : 'ghost'}
        expand={inDrawer}
        onClick={props.onSignIn}
        testId={inDrawer ? TEST_IDS.publicNavSignInDrawer : TEST_IDS.publicNavSignIn}
      />
      <AppButton
        label={props.signUpLabel}
        tone="primary"
        expand={inDrawer}
        onClick={props.onSignUp}
        testId={inDrawer ? TEST_IDS.publicNavSignUpDrawer : TEST_IDS.publicNavSignUp}
      />
    </>
  );
}
