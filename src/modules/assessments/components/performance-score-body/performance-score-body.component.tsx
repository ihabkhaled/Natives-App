import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { PerformanceScoreBodyProps } from './performance-score-body.types';

/**
 * The resolved score body: value (or an honest "not computed yet"),
 * confidence/completeness badges, the accessible component table, and the
 * cited rule reference.
 */
export function PerformanceScoreBody(props: PerformanceScoreBodyProps): React.JSX.Element {
  const { view } = props;
  return (
    <div className="flex flex-col gap-3">
      {view.unavailableMessage === null ? null : (
        <IonNote color="danger" className="block" role="status">
          {view.unavailableMessage}
        </IonNote>
      )}
      <IonText>
        <p
          data-testid={TEST_IDS.performanceScoreValue}
          className={`m-0 font-bold ${view.hasValue ? 'text-4xl' : 'text-lg'}`}
        >
          {view.valueText}
        </p>
      </IonText>
      {view.hasValue ? (
        <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <dt className="text-xs opacity-70">{view.confidenceLabel}</dt>
            <dd className="m-0 font-semibold">{view.confidenceValue}</dd>
          </div>
          <div>
            <dt className="text-xs opacity-70">{view.completenessLabel}</dt>
            <dd className="m-0 font-semibold">{view.completenessText}</dd>
          </div>
        </dl>
      ) : null}
      {view.components.length > 0 ? (
        <div className="overflow-x-auto" data-testid={TEST_IDS.performanceScoreExplanation}>
          <table className="w-full text-start text-sm">
            <caption className="text-start text-xs opacity-70">{view.explanationTitle}</caption>
            <thead>
              <tr>
                {view.componentColumns.map((column) => (
                  <th key={column} scope="col" className="text-start font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.components.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="text-start font-normal">
                    {row.label}
                  </th>
                  <td>{row.weightText}</td>
                  <td>{row.valueText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {view.ruleReference === '' ? null : (
        <IonNote className="block text-xs">{view.ruleReference}</IonNote>
      )}
    </div>
  );
}
