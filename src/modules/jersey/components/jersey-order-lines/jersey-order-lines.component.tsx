import { TEST_IDS } from '@/shared/config';
import { LoadingState, StatusChip } from '@/shared/ui';

import type { JerseyOrderLinesProps } from './jersey-order-lines.types';

/**
 * The packing list for one order: exactly what the supplier is given, in the
 * order they will read it.
 *
 * A line's personalization is rendered only when there is one, so the lines
 * that carry a member's name and number out to an outside company stand apart
 * from the anonymous stock alongside them.
 */
export function JerseyOrderLines(props: JerseyOrderLinesProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      className="app-jersey__lines flex flex-col gap-2 pt-2"
      aria-label={view.reference}
      data-testid={`${TEST_IDS.jerseyRow}-${view.orderId}-lines`}
    >
      {view.isLoading ? (
        <LoadingState
          label={view.loadingLabel}
          variant="list"
          testId={`${TEST_IDS.jerseyLoading}-${view.orderId}`}
        />
      ) : (
        <>
          <span>
            <StatusChip label={view.statusLabel} tone={view.statusTone} />
          </span>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {view.lines.map((line) => (
              <li key={line.id} className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold">{line.productName}</span>
                <span className="app-muted-text text-xs uppercase">{line.sizeLabel}</span>
                <span className="app-muted-text text-xs">{line.kitLabel}</span>
                <span className="app-muted-text text-xs">{line.sleevesLabel}</span>
                <span className="text-sm">{line.quantityLabel}</span>
                {line.personalization === null ? null : (
                  <span className="text-xs font-medium">{line.personalization}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
