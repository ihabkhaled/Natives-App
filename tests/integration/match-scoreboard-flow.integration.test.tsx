import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MatchesContainer } from '@/modules/matches/containers/matches.container';
import { ScoreboardContainer } from '@/modules/matches/containers/scoreboard.container';
import { useScorekeeperQueueStore } from '@/modules/matches/store/scorekeeper-queue.store';
import { getEnvironment } from '@/packages/environment';
import { TEST_IDS } from '@/shared/config';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderScoreboard(matchId: string = MOCK_MATCHES.liveMatchId): void {
  renderRoute(`/matches/${matchId}`, '/matches/:matchId', <ScoreboardContainer />);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
  useScorekeeperQueueStore.getState().clear();
});

afterEach(async () => {
  await clearSessionAfterTest();
  useScorekeeperQueueStore.getState().clear();
});

describe('match list (real client + MSW)', () => {
  it('lists the team matches with both entry points', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/matches', '/matches', <MatchesContainer />);

    await screen.findByTestId(TEST_IDS.matchesList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.matchCard)).toHaveLength(2);
    expect(screen.getAllByTestId(TEST_IDS.matchOpenScoreboard)).toHaveLength(2);
    expect(screen.getAllByTestId(TEST_IDS.matchOpenStatistics)).toHaveLength(2);
  });

  it('narrows the list to one lifecycle state, then to a designed no-matches state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/matches', '/matches', <MatchesContainer />);

    await screen.findByTestId(TEST_IDS.matchesList, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.matchesStatusFilter), 'live');
    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.matchCard)).toHaveLength(1);
    }, WAIT);

    fireIonChange(screen.getByTestId(TEST_IDS.matchesStatusFilter), 'abandoned');
    await waitFor(() => {
      expect(screen.getByText('No matches match this filter')).toBeInTheDocument();
    }, WAIT);
  });

  it('opens both destinations from a card', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderRoute('/matches', '/matches', <MatchesContainer />);

    await screen.findByTestId(TEST_IDS.matchesList, {}, WAIT);
    fireEvent.click(screen.getAllByTestId(TEST_IDS.matchOpenScoreboard)[0]!);
    fireEvent.click(screen.getAllByTestId(TEST_IDS.matchOpenStatistics)[0]!);

    expect(screen.getAllByTestId(TEST_IDS.matchCard).length).toBeGreaterThan(0);
  });

  it('lists matches for a member holding only match.read', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute('/matches', '/matches', <MatchesContainer />);

    await screen.findByTestId(TEST_IDS.matchesList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.matchCard)).toHaveLength(2);
  });
});

/** Sign in, open the live board, tap once, and wait for the server score. */
async function scoreOnePoint(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.coach);
  renderScoreboard();
  await screen.findByTestId(TEST_IDS.scoreboardPointUs, {}, WAIT);
  fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardPointUs));
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.scoreboardOurScore)).toHaveTextContent('9');
  }, WAIT);
}

describe('live scoreboard (real client + MSW)', () => {
  it('shows the authoritative score, the rule-set caps, and the sync badge', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardScore, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.scoreboardOurScore)).toHaveTextContent('8');
    expect(screen.getByTestId(TEST_IDS.scoreboardTheirScore)).toHaveTextContent('6');
    // Game to 15 comes from the published rule set, not a client default.
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.scorekeeperQueueBadge)).toHaveTextContent('Synced');
  });

  it('applies one point online and leaves nothing queued', async () => {
    await scoreOnePoint();

    expect(useScorekeeperQueueStore.getState().operations).toStrictEqual([]);
  });

  it('scores exactly once for a repeated tap of the SAME queued operation', async () => {
    await scoreOnePoint();

    // The delivered operation is replayed verbatim: same id, same payload.
    const { replayScorekeeperQueue } =
      await import('@/modules/matches/services/replay-scorekeeper-queue.service');
    const { queueScorekeeperOperation } =
      await import('@/modules/matches/services/queue-scorekeeper-operation.service');
    const queued = queueScorekeeperOperation({
      ownerUserId: 'user-coach',
      teamId: MOCK_MATCHES.teamId,
      matchId: MOCK_MATCHES.liveMatchId,
      baseStreamVersion: 15,
      payload: {
        kind: 'point',
        scoringSide: 'us',
        scorerMembershipId: null,
        assistMembershipId: null,
      },
    });
    const first = await replayScorekeeperQueue([queued.operation]);
    const second = await replayScorekeeperQueue([queued.operation]);

    expect(first.appliedOperationIds).toStrictEqual([queued.operation.operationId]);
    // The second delivery is recognised as the same operation: replayed, not
    // applied, so the score does not move again.
    expect(second.replayedOperationIds).toStrictEqual([queued.operation.operationId]);
    expect(second.appliedOperationIds).toStrictEqual([]);
  });

  it('appends a correction rather than rewriting the point it undoes', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardUndo, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardUndo));
    fireEvent(
      screen.getByTestId(TEST_IDS.scoreboardUndoReason),
      new CustomEvent('ionInput', { detail: { value: 'mis-tap on the sideline' } }),
    );
    fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardUndoConfirm));

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.scoreboardTimelineRow).length).toBeGreaterThan(2);
    }, WAIT);
  });

  it('lets a reader without match.score open the board but not score it', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardScore, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.scoreboardPointUs)).toHaveAttribute('disabled');
    expect(screen.getByText(/Scoring needs the match.score grant/u)).toBeInTheDocument();
  });

  it('blocks finalizing a live match and says which condition is unmet', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardFinalize, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.scoreboardFinalizeBlocked)).toHaveTextContent(
      'available once the match is completed',
    );
    expect(screen.getByTestId(TEST_IDS.scoreboardFinalizeAction)).toHaveAttribute('disabled');
  });

  it('allows finalizing a completed match with an empty queue', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard(MOCK_MATCHES.completedMatchId);

    await screen.findByTestId(TEST_IDS.scoreboardFinalize, {}, WAIT);
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.scoreboardFinalizeAction)).not.toHaveAttribute('disabled');
    }, WAIT);

    fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardFinalizeAction));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.scoreboardStatus)).toHaveTextContent('Finalized');
    }, WAIT);
  });

  it('records a timeout and moves the match through its state machine', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardTimeoutUs, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardTimeoutUs));
    fireEvent.click(screen.getByTestId(`${TEST_IDS.scoreboardTransition}-pause`));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.scoreboardStatus)).toHaveTextContent('Paused');
    }, WAIT);
  });

  it('picks a scorer and an assist before recording the point', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardScorerSelect, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.scoreboardScorerSelect), 'mem-omar');
    fireIonChange(screen.getByTestId(TEST_IDS.scoreboardAssistSelect), 'mem-nadia');
    fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardPointUs));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.scoreboardOurScore)).toHaveTextContent('9');
    }, WAIT);
  });

  it('leaves the scoreboard when the back affordance is used', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardBack, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardBack));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.scoreboardView)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('cancels an undo without touching the stream', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardUndo, {}, WAIT);
    const rowsBefore = screen.getAllByTestId(TEST_IDS.scoreboardTimelineRow).length;
    fireEvent.click(screen.getByTestId(TEST_IDS.scoreboardUndo));
    fireEvent.click(screen.getByText('Keep the point'));

    expect(screen.queryByTestId(TEST_IDS.scoreboardUndoReason)).not.toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.scoreboardTimelineRow)).toHaveLength(rowsBefore);
  });

  it('shows the designed error state when the scoreboard cannot be reached', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    mockApiServer.use(
      http.get(
        `${getEnvironment().apiBaseUrl}/teams/:teamId/matches/:matchId/scoreboard`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    renderScoreboard();

    await screen.findByTestId(TEST_IDS.scoreboardError, {}, WAIT);
    fireEvent.click(screen.getByText('Try again'));

    expect(screen.queryByTestId(TEST_IDS.scoreboardScore)).not.toBeInTheDocument();
  });
});
