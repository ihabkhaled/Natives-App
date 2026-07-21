import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MatchStatisticsContainer } from '@/modules/matches/containers/match-statistics.container';
import { getEnvironment } from '@/packages/environment';
import { TEST_IDS } from '@/shared/config';
import { matchStatisticsResponse } from '@/tests/msw/match-statistics.fixture';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

/** The directory display names of the two honest edge-case rows. */
const ZERO_PLAYER_NAME = 'Mai Salah';
const UNMEASURED_PLAYER_NAME = 'Zeyad Kamal';

function renderStatistics(): void {
  renderRoute(
    `/matches/${MOCK_MATCHES.liveMatchId}/statistics`,
    '/matches/:matchId/statistics',
    <MatchStatisticsContainer />,
  );
}

function statisticsUrl(): string {
  return `${getEnvironment().apiBaseUrl}/teams/:teamId/matches/:matchId/statistics`;
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('match statistics (real client + MSW)', () => {
  it('renders EVERY rostered player, including one with no recorded contribution', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsPlayers, {}, WAIT);
    const rows = screen.getAllByTestId(TEST_IDS.matchStatsPlayerRow);

    expect(rows).toHaveLength(4);
    expect(screen.getByText('4 players on the match roster')).toBeInTheDocument();
    expect(screen.getAllByText('No recorded contribution')).toHaveLength(1);
  });

  it('prints a measured zero as 0 and an unmeasured value as "not enough data"', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsPlayers, {}, WAIT);
    const rows = screen.getAllByTestId(TEST_IDS.matchStatsPlayerRow);
    const zeroRow = rows.find((row) => row.textContent.includes(ZERO_PLAYER_NAME));
    const unmeasuredRow = rows.find((row) => row.textContent.includes(UNMEASURED_PLAYER_NAME));

    expect(within(zeroRow!).getAllByText('0').length).toBeGreaterThan(0);
    expect(within(unmeasuredRow!).getAllByText('Not enough data')).toHaveLength(8);
    expect(within(unmeasuredRow!).queryAllByText('0')).toHaveLength(0);
  });

  it('ships an accessible table alternative next to the chart', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsChart, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.chartDataToggle)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.chartDataTable)).toBeInTheDocument();
  });

  it('opens one player report and says the line is a measured zero', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsPlayers, {}, WAIT);
    const rows = screen.getAllByTestId(TEST_IDS.matchStatsPlayerRow);
    const zeroRow = rows.find((row) => row.textContent.includes(ZERO_PLAYER_NAME));
    fireEvent.click(within(zeroRow!).getByTestId(TEST_IDS.matchStatsPlayerOpen));

    await waitFor(() => {
      expect(screen.getByText(/was rostered and recorded no contribution/u)).toBeInTheDocument();
    }, WAIT);
  });

  it('marks video analysis as an unshipped backend capability and mocks nothing', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsVideo, {}, WAIT);
    const panel = screen.getByTestId(TEST_IDS.matchStatsVideo);

    expect(within(panel).getByText('Video analysis is not available yet')).toBeInTheDocument();
    expect(within(panel).getByText(/docs\/api-verification\.md/u)).toBeInTheDocument();
  });

  it('says why a measure is missing when the point stream was incomplete', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    mockApiServer.use(
      http.get(statisticsUrl(), () =>
        HttpResponse.json({
          ...matchStatisticsResponse(MOCK_MATCHES.liveMatchId),
          lineupsRecorded: false,
        }),
      ),
    );
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsDerivation, {}, WAIT);
    expect(screen.getAllByText(/Point lineups or plays were not recorded/u).length).toBeGreaterThan(
      0,
    );
  });

  it('shows the designed forbidden state without the stats grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.matchStatsPlayers)).not.toBeInTheDocument();
  });

  it('closes an open report and returns to the match list', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsPlayers, {}, WAIT);
    fireEvent.click(screen.getAllByTestId(TEST_IDS.matchStatsPlayerOpen)[0]!);
    await screen.findByText('Close report', {}, WAIT);
    fireEvent.click(screen.getByText('Close report'));

    await waitFor(() => {
      expect(screen.queryByText('Close report')).not.toBeInTheDocument();
    }, WAIT);

    fireEvent.click(screen.getByTestId(TEST_IDS.matchStatsBack));
    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.matchStatsView)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('shows the designed error state and retries the derivation', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    mockApiServer.use(http.get(statisticsUrl(), () => new HttpResponse(null, { status: 500 })));
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsError, {}, WAIT);
    fireEvent.click(screen.getByText('Try again'));

    expect(screen.queryByTestId(TEST_IDS.matchStatsPlayers)).not.toBeInTheDocument();
  });

  it('shows the designed empty state when nothing has been derived', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    mockApiServer.use(
      http.get(statisticsUrl(), () =>
        HttpResponse.json({
          ...matchStatisticsResponse(MOCK_MATCHES.liveMatchId),
          players: [],
        }),
      ),
    );
    renderStatistics();

    await screen.findByTestId(TEST_IDS.matchStatsEmpty, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.matchStatsPlayerRow)).not.toBeInTheDocument();
  });
});
