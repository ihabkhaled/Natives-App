import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { RankExplanationPanelProps } from './rank-explanation-panel.types';

/**
 * Per-row rank explanation: the contributing sums the server reported plus
 * the rule version it applied. There is no client-side formula anywhere here.
 */
export function RankExplanationPanel(props: RankExplanationPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <div data-testid={TEST_IDS.leaderboardExplainPanel} className="app-rank-explain">
      <span className="app-eyebrow">{view.heading}</span>
      <IonNote>{view.intro}</IonNote>
      {view.rows.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <table className="app-rank-explain__table">
          <thead>
            <tr>
              <th scope="col">{view.categoryColumn}</th>
              <th scope="col">{view.pointsColumn}</th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.category}</th>
                <td>{row.pointsText}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{view.totalLabel}</th>
              <td>{view.totalText}</td>
            </tr>
          </tfoot>
        </table>
      )}
      <IonNote>{view.ruleVersionLabel}</IonNote>
      <IonNote>{view.serverNotice}</IonNote>
    </div>
  );
}
