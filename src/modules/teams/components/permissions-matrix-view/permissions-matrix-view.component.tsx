import { APP_ICONS } from '@/packages/icons';
import { IonIcon, IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { SectionPanel, SelectField, WorkspaceScreen } from '@/shared/ui';

import { MATRIX_STATE_TEST_IDS } from './permissions-matrix-view.constants';
import type { PermissionsMatrixViewProps } from './permissions-matrix-view.types';

/**
 * The seeded catalog as a real table: one row per permission, one column per
 * role bundle. Every cell states its meaning to assistive tech, so the grid
 * never depends on a tick mark alone to carry the answer.
 */
export function PermissionsMatrixView(props: PermissionsMatrixViewProps): React.JSX.Element {
  const { view } = props;
  return (
    <WorkspaceScreen
      title={view.title}
      subtitle={view.subtitle}
      pageTestId={TEST_IDS.permissionsMatrixPage}
      viewTestId={TEST_IDS.permissionsMatrixView}
      className="app-permissions-matrix"
      notice={view.notice}
      state={{ view, variant: 'list', ...MATRIX_STATE_TEST_IDS }}
      toolbar={
        <SelectField
          testId={TEST_IDS.permissionsMatrixAreaFilter}
          label={view.areaLabel}
          value={view.area}
          options={view.areaOptions}
          onChange={view.onAreaChange}
        />
      }
    >
      <SectionPanel heading={view.policyVersionLabel} intro={view.countSummary}>
        <div className="app-matrix-scroll">
          <table
            data-testid={TEST_IDS.permissionsMatrixTable}
            className="app-matrix-table"
            aria-label={view.title}
          >
            <thead>
              <tr>
                <th scope="col">{view.permissionColumnLabel}</th>
                {view.columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                    {column.isSystem ? (
                      <IonNote className="app-matrix-table__system">{view.systemRoleLabel}</IonNote>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.key} data-testid={TEST_IDS.permissionsMatrixRow}>
                  <th scope="row">
                    <span className="app-matrix-table__permission">{row.permission}</span>
                    <IonNote className="app-matrix-table__description">{row.description}</IonNote>
                  </th>
                  {row.cells.map((cell) => (
                    <td key={cell.roleKey} className="app-matrix-table__cell">
                      <IonIcon
                        icon={cell.isGranted ? APP_ICONS.checkmark : APP_ICONS.dot}
                        aria-hidden="true"
                        className={
                          cell.isGranted
                            ? 'app-matrix-table__mark app-matrix-table__mark--on'
                            : 'app-matrix-table__mark'
                        }
                      />
                      <span className="sr-only">{cell.label}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </WorkspaceScreen>
  );
}
