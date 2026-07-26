import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { RuleVersionCardProps, StandingsRulesListProps } from './standings-rules-list.types';

function versionBody(props: RuleVersionCardProps): React.JSX.Element {
  return (
    <div
      data-testid={TEST_IDS.standingsRuleVersion}
      className={props.prominent ? 'app-rule-version app-rule-version--newest' : 'app-rule-version'}
    >
      <div className="app-rule-version__head">
        <p className="app-rule-version__title m-0">{props.version.heading}</p>
        <StatusChip label={props.version.statusChip.label} tone={props.version.statusChip.tone} />
      </div>
      <ul className="app-rule-version__points">
        {props.version.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <ol className="app-rule-version__tiebreaks" aria-label={props.version.heading}>
        {props.version.tieBreakChips.map((chip) => (
          <li key={chip} className="app-rule-version__tiebreak">
            {chip}
          </li>
        ))}
      </ol>
      <IonNote>{props.version.effectiveFrom}</IonNote>
    </div>
  );
}

/**
 * Rule families grouped newest-first. Older versions sit collapsed beneath the
 * current one — visible history, never editable history.
 */
export function StandingsRulesList(props: StandingsRulesListProps): React.JSX.Element {
  return (
    <ul className="app-rules-list" data-testid={TEST_IDS.standingsRulesList}>
      {props.families.map((family) => (
        <li
          key={family.key}
          className="app-rules-list__family"
          data-testid={TEST_IDS.standingsRuleFamily}
        >
          {versionBody({ version: family.newest, prominent: true })}
          {family.olderLabel === null ? null : (
            <details className="app-rules-list__older">
              <summary>{family.olderLabel}</summary>
              {family.older.map((version) => (
                <div key={version.key}>{versionBody({ version, prominent: false })}</div>
              ))}
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}
