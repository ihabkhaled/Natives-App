import { IonNote } from '@/packages/ionic';

import { EmptyState } from '../empty-state';
import { SelectField } from '../select-field';
import { WorkspaceScreen } from '../workspace-screen';
import type { ListScreenProps } from './list-screen.types';

/**
 * The canonical bounded-list screen: the shared workspace shell plus
 * client-side filters, a match count, and the "nothing matched" state a
 * filtered — as opposed to genuinely empty — list needs.
 */
export function ListScreen(props: ListScreenProps): React.JSX.Element {
  return (
    <WorkspaceScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={props.pageTestId}
      viewTestId={props.viewTestId}
      className={props.className}
      toolbar={
        <div className="app-list-screen__filters">
          {props.filters.map((filter) => (
            <SelectField key={filter.label} {...filter} />
          ))}
          {props.filterExtra}
        </div>
      }
      state={props.state}
    >
      {props.hasMatches ? (
        <>
          <IonNote>{props.countLabel}</IonNote>
          {props.children}
        </>
      ) : (
        <EmptyState title={props.noMatchesTitle} message={props.noMatchesMessage} />
      )}
    </WorkspaceScreen>
  );
}
