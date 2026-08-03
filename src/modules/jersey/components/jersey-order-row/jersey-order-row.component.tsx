import { TEST_IDS } from '@/shared/config';

import { JerseyOrderLines } from '../jersey-order-lines';
import { JerseyOrderSummary } from '../jersey-order-summary';
import type { JerseyOrderRowProps } from './jersey-order-row.types';

/**
 * One order.
 *
 * Without `jersey.manage` the row is inert rather than disabled: opening an
 * order shows the names being printed on members' shirts, and a control that
 * looks available but refuses on click teaches an operator nothing.
 */
export function JerseyOrderRow(props: JerseyOrderRowProps): React.JSX.Element {
  const { view } = props;
  return (
    <article
      className="app-surface-card app-jersey__row flex flex-col gap-2 p-4"
      data-testid={`${TEST_IDS.jerseyRow}-${view.id}`}
    >
      {view.canOpen ? (
        <button
          type="button"
          className="flex w-full flex-col items-start gap-2 text-start"
          aria-expanded={view.isOpen}
          data-testid={`${TEST_IDS.jerseyAction}-${view.id}`}
          onClick={() => {
            props.onToggle(view.id);
          }}
        >
          <JerseyOrderSummary view={view} />
        </button>
      ) : (
        <JerseyOrderSummary view={view} />
      )}
      {props.detail === null ? null : <JerseyOrderLines view={props.detail} />}
    </article>
  );
}
