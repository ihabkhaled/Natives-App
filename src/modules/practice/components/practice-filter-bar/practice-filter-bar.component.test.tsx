import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { fireIonChange } from '../../../../../tests/setup/ionic-events.helper';
import { buildPracticeFilterView } from '../../../../../tests/factories/practice-view.factory';
import { PRACTICE_SCOPE, PRACTICE_TYPE, RSVP_STATUS } from '../../constants/practice.constants';
import { PracticeFilterBar } from './practice-filter-bar.component';

describe('PracticeFilterBar', () => {
  it('reports a scope change', () => {
    const onScopeChange = vi.fn();
    render(<PracticeFilterBar filter={buildPracticeFilterView({ onScopeChange })} />);

    fireIonChange(screen.getByTestId(TEST_IDS.practiceScopeFilter), PRACTICE_SCOPE.past);

    expect(onScopeChange).toHaveBeenCalledWith(PRACTICE_SCOPE.past);
  });

  it('reports a type change and maps the all option to null', () => {
    const onTypeChange = vi.fn();
    render(<PracticeFilterBar filter={buildPracticeFilterView({ onTypeChange })} />);

    fireIonChange(screen.getByTestId(TEST_IDS.practiceTypeFilter), PRACTICE_TYPE.practice);
    expect(onTypeChange).toHaveBeenCalledWith(PRACTICE_TYPE.practice);

    fireIonChange(screen.getByTestId(TEST_IDS.practiceTypeFilter), '');
    expect(onTypeChange).toHaveBeenCalledWith(null);
  });

  it('reports an RSVP filter change and maps the all option to null', () => {
    const onRsvpChange = vi.fn();
    render(<PracticeFilterBar filter={buildPracticeFilterView({ onRsvpChange })} />);

    fireIonChange(screen.getByTestId(TEST_IDS.practiceRsvpFilter), RSVP_STATUS.going);
    expect(onRsvpChange).toHaveBeenCalledWith(RSVP_STATUS.going);

    fireIonChange(screen.getByTestId(TEST_IDS.practiceRsvpFilter), '');
    expect(onRsvpChange).toHaveBeenCalledWith(null);
  });
});
