import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildPracticeDaySectionView,
  buildPracticeSessionCardView,
} from '../../../../../tests/factories/practice-view.factory';
import { PracticeDaySection } from './practice-day-section.component';

describe('PracticeDaySection', () => {
  it('labels the day and renders one card per session', () => {
    render(
      <PracticeDaySection
        section={buildPracticeDaySectionView({
          dayLabel: 'Sunday, July 26, 2026',
          sessions: [
            buildPracticeSessionCardView({ id: 'a' }),
            buildPracticeSessionCardView({ id: 'b' }),
          ],
        })}
        onSelectSession={vi.fn()}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceDaySection)).toHaveAttribute(
      'aria-label',
      'Sunday, July 26, 2026',
    );
    expect(screen.getAllByTestId(TEST_IDS.practiceSessionCard)).toHaveLength(2);
  });
});
