import { PermissionsMatrixView } from '../components/permissions-matrix-view';
import { usePermissionsMatrix } from '../hooks/use-permissions-matrix.hook';

/** Wires the permissions-matrix hook to its presentational screen. */
export function PermissionsMatrixContainer(): React.JSX.Element {
  return <PermissionsMatrixView view={usePermissionsMatrix()} />;
}
