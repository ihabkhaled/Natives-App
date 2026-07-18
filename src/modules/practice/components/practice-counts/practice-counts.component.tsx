import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import type { PracticeCountsProps } from './practice-counts.types';

/** Privacy-safe attendance intent counts, or a note when not shared. */
export function PracticeCounts(props: PracticeCountsProps): React.JSX.Element {
  return (
    <section data-testid={TEST_IDS.practiceCounts} aria-label={props.heading}>
      <IonText>
        <h2 className="m-0 mb-1 text-base font-semibold">{props.heading}</h2>
      </IonText>
      {props.counts === null ? (
        <IonNote>{props.privateLabel}</IonNote>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {props.counts.map((count) => (
              <tr key={count.key}>
                <th scope="row" className="py-1 text-start font-normal">
                  {count.label}
                </th>
                <td className="py-1 text-end font-semibold">{count.countText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
