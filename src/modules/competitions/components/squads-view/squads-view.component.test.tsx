import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildSquadsListView } from '../../../../../tests/factories/competitions-view.factory';
import { CompetitionOpponentList } from '../competition-opponent-list/competition-opponent-list.component';
import { SquadsView } from './squads-view.component';

describe('SquadsView', () => {
  it('lists the squads when the screen is ready', () => {
    render(<SquadsView {...buildSquadsListView()} />);

    expect(screen.getByTestId(TEST_IDS.squadsList)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.squadCard)).toHaveTextContent('League squad');
  });

  it('shows the designed no-matches state instead of an empty list', () => {
    render(<SquadsView {...buildSquadsListView({ hasMatches: false, items: [] })} />);

    expect(screen.getByText('No squads match this filter')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.squadsList)).not.toBeInTheDocument();
  });

  it('renders only the async state block while loading', () => {
    render(<SquadsView {...buildSquadsListView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.competitionsLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.squadsList)).not.toBeInTheDocument();
  });

  it('renders the forbidden state for a principal without the grant', () => {
    render(<SquadsView {...buildSquadsListView({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.competitionsForbidden)).toBeInTheDocument();
  });
});

describe('CompetitionOpponentList', () => {
  it('says the directory is empty rather than rendering an empty list', () => {
    render(<CompetitionOpponentList items={[]} emptyLabel="No opponents registered." />);

    expect(screen.getByText('No opponents registered.')).toBeInTheDocument();
  });

  it('omits the short name when the opponent has none', () => {
    render(
      <CompetitionOpponentList
        items={[
          { id: 'o1', name: 'Nile Nomads', shortName: 'NIL', statusLabel: 'Active' },
          { id: 'o2', name: 'Delta Discs', shortName: null, statusLabel: 'Archived' },
        ]}
        emptyLabel="No opponents registered."
      />,
    );

    const rows = screen.getAllByTestId(TEST_IDS.competitionOpponent);
    expect(rows[0]).toHaveTextContent('NIL');
    expect(rows[1]).toHaveTextContent('Delta Discs');
    expect(rows[1]).toHaveTextContent('Archived');
  });
});
