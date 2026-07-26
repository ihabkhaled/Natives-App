import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell } from '@/shared/ui';

import { RuleVersionForm } from '../rule-version-form';
import { StandingsRulesList } from '../standings-rules-list';
import { STANDINGS_RULES_STATE_TEST_IDS } from './standings-rules-view.constants';
import type { StandingsRulesScreenProps } from './standings-rules-view.types';

/**
 * The versioned point rules. The invariant is stated in copy — rules are
 * never edited, publishing creates version N+1 — and read-only visitors see
 * the catalog without the form.
 */
export function StandingsRulesScreen(props: StandingsRulesScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.standingsRulesPage}>
      <section
        data-testid={TEST_IDS.standingsRulesView}
        aria-label={props.title}
        className="app-standings flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <p className="app-pending-notice m-0" role="note">
          {props.immutableNotice}
        </p>

        {props.savedBanner === null ? null : (
          <p className="app-pending-notice m-0" role="status">
            {props.savedBanner}
          </p>
        )}

        {props.formToggleLabel === null ? null : (
          <AppButton
            label={props.formToggleLabel}
            tone="secondary"
            testId={TEST_IDS.ruleFormToggle}
            onClick={props.onToggleForm}
          />
        )}

        {props.form === null ? null : <RuleVersionForm view={props.form} />}

        <AsyncStateView view={props} variant="list" {...STANDINGS_RULES_STATE_TEST_IDS} />

        {props.status === 'ready' ? <StandingsRulesList families={props.families} /> : null}
      </section>
    </PageShell>
  );
}
