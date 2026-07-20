import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildSquadsListView } from '../../../../../tests/factories/competitions-view.factory';
import { RostersView } from '../rosters-view/rosters-view.component';
import { RosterValidationPanel } from './roster-validation-panel.component';

const NOOP = (): void => {
  // inert handler for a UI-only assertion
};

const PANEL = {
  heading: 'Validation preview',
  intro: 'The server checks the roster.',
  verdictLabel: 'Ready to publish',
  verdictTone: 'success',
  compositionHeading: 'Composition',
  composition: [{ key: 'selected', label: 'Selected', value: '14' }],
  violationsHeading: 'Constraint violations',
  violationsEmptyLabel: 'The roster meets every constraint.',
  violations: [],
};

const LIST = {
  ...buildSquadsListView(),
  countLabel: 'Showing 1 of 1 rosters',
  kindFilterLabel: 'Roster kind',
  kindFilter: 'all',
  kindOptions: [{ value: 'all', label: 'All' }],
  items: [
    {
      id: 'r-1',
      name: 'League roster',
      kindLabel: 'Competition roster',
      statusLabel: 'Draft',
      statusTone: 'medium',
      divisionLabel: 'Mixed',
      sizeLabel: '12–20 players',
      revisionLabel: 'Revision 1',
      openLabel: 'Open roster',
    },
  ],
  onKindFilterChange: NOOP,
  onOpen: NOOP,
};

describe('RosterValidationPanel', () => {
  it('says the roster meets every constraint when nothing was reported', () => {
    render(<RosterValidationPanel view={PANEL} />);

    expect(screen.getByText('The roster meets every constraint.')).toBeInTheDocument();
    expect(screen.queryAllByTestId(TEST_IDS.rosterViolation)).toHaveLength(0);
  });

  it('lists each reported violation with its severity', () => {
    render(
      <RosterValidationPanel
        view={{
          ...PANEL,
          verdictLabel: 'Blocked by a constraint',
          verdictTone: 'warning',
          violations: [
            {
              key: 'min_size',
              label: 'Below the minimum squad size',
              severityLabel: 'Blocking',
              tone: 'danger',
            },
          ],
        }}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.rosterViolation)).toHaveTextContent(
      'Below the minimum squad size',
    );
  });
});

describe('RostersView', () => {
  it('lists the rosters when the screen is ready', () => {
    render(<RostersView {...LIST} />);

    expect(screen.getByTestId(TEST_IDS.rosterCard)).toHaveTextContent('League roster');
  });

  it('shows the designed no-matches state instead of an empty list', () => {
    render(<RostersView {...LIST} hasMatches={false} items={[]} />);

    expect(screen.queryByTestId(TEST_IDS.rostersList)).not.toBeInTheDocument();
  });

  it('renders only the async state block while loading', () => {
    render(<RostersView {...LIST} status="loading" />);

    expect(screen.getByTestId(TEST_IDS.competitionsLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.rostersList)).not.toBeInTheDocument();
  });

  it('renders the forbidden state for a principal without the grant', () => {
    render(<RostersView {...LIST} status="forbidden" />);

    expect(screen.getByTestId(TEST_IDS.competitionsForbidden)).toBeInTheDocument();
  });
});
