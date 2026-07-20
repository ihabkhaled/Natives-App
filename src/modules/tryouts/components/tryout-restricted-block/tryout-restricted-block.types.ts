import type { RestrictedBlockView } from '../../types/tryouts-view.types';

export interface TryoutRestrictedBlockProps {
  readonly view: RestrictedBlockView;
  readonly testId: string;
  readonly restrictedTestId: string;
}
