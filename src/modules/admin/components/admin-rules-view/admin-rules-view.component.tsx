import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, ListScreen, StatusChip } from '@/shared/ui';

import { RuleDetailPanel } from '../rule-detail-panel';
import { RULES_STATE_TEST_IDS } from './admin-rules-view.constants';
import type { AdminRulesViewProps } from './admin-rules-view.types';

/** Versioned points and calculation rules with their lifecycle and dry run. */
export function AdminRulesView(props: AdminRulesViewProps): React.JSX.Element {
  return (
    <ListScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.adminRulesPage}
      viewTestId={TEST_IDS.adminRulesView}
      className="app-admin-rules"
      filters={[
        {
          label: props.familyLabel,
          value: props.family,
          options: props.familyOptions,
          onChange: props.onFamilyChange,
          testId: TEST_IDS.adminRulesFamilySelect,
        },
        {
          label: props.statusFilterLabel,
          value: props.statusFilter,
          options: props.statusOptions,
          onChange: props.onStatusFilterChange,
          testId: TEST_IDS.adminRulesStatusSelect,
        },
      ]}
      filterExtra={
        props.readOnlyNotice === null ? undefined : (
          <p className="app-pending-notice m-0" role="note">
            {props.readOnlyNotice}
          </p>
        )
      }
      state={{ view: props, variant: 'list', ...RULES_STATE_TEST_IDS }}
      countLabel={props.countLabel}
      hasMatches={props.hasMatches}
      noMatchesTitle={props.noMatchesTitle}
      noMatchesMessage={props.noMatchesMessage}
    >
      <ul className="app-admin-rules__list">
        {props.rows.map((row) => (
          <li
            key={row.ruleId}
            data-testid={TEST_IDS.adminRuleRow}
            className="app-surface-card app-admin-rules__row"
          >
            <div className="app-admin-rules__row-main">
              <IonText>
                <h3 className="app-admin-rules__row-title m-0">{row.name}</h3>
              </IonText>
              <IonNote>{row.versionLabel}</IonNote>
              <IonNote>{row.effectiveLabel}</IonNote>
            </div>
            <div className="app-admin-rules__row-meta">
              <StatusChip label={row.statusLabel} tone={row.statusTone} />
              <AppButton
                label={row.openLabel}
                tone="ghost"
                testId={TEST_IDS.adminRuleOpen}
                onClick={() => {
                  props.onSelect(row.ruleId);
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      {props.detail === null ? (
        <IonNote>{props.selectPrompt}</IonNote>
      ) : (
        <RuleDetailPanel {...props.detail} />
      )}
    </ListScreen>
  );
}
