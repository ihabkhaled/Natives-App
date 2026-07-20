import type { FactListProps } from './fact-list.types';

/**
 * A labelled fact grid. Every value is already resolved by its hook, so an
 * unknown reads "not enough data" here rather than an empty cell.
 */
export function FactList(props: FactListProps): React.JSX.Element {
  return (
    <dl data-testid={props.testId} aria-label={props.ariaLabel} className="app-fact-list">
      {props.items.map((item) => (
        <div key={item.key} className="app-fact-list__row">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
