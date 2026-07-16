import { useHistory, useLocation } from 'react-router-dom';

import type { AppNavigation } from '../router.types';

/**
 * The single owner of router hook access. Feature hooks compose this
 * instead of importing react-router hooks directly.
 */
export function useAppNavigation(): AppNavigation {
  const history = useHistory();
  const location = useLocation();
  return {
    push: (path) => {
      history.push(path);
    },
    replace: (path) => {
      history.replace(path);
    },
    goBack: () => {
      history.goBack();
    },
    currentPath: location.pathname,
  };
}
