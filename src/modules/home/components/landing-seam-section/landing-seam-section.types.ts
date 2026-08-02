import type { ReactNode } from 'react';

import type { LandingSeamChrome } from '../../helpers/landing-seam-copy.helper';

export interface LandingSeamStateTestIds {
  readonly loadingTestId: string;
  readonly errorTestId: string;
  readonly offlineTestId: string;
  readonly forbiddenTestId: string;
  readonly emptyTestId: string;
}

export interface LandingSeamSectionProps {
  readonly heading: string;
  readonly intro: string;
  readonly chrome: LandingSeamChrome;
  readonly sectionTestId: string;
  readonly stateTestIds: LandingSeamStateTestIds;
  readonly children: ReactNode;
}
