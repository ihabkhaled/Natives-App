import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { AdminRulesContainer } from '@/modules/admin/containers/admin-rules.container';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_ADMIN } from '@/tests/msw/admin.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  apiUrl,
  retryFromErrorState,
  registerIntegrationSession,
} from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

async function openRules(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminRules, APP_PATHS.adminRules, <AdminRulesContainer />);
  await screen.findAllByTestId(TEST_IDS.adminRuleRow, {}, WAIT);
}

/** Open the rule whose name identifies its lifecycle state. */
async function openRule(name: string): Promise<void> {
  const rows = screen.getAllByTestId(TEST_IDS.adminRuleRow);
  const match = rows.find((row) => row.textContent.includes(name));
  expect(match).toBeDefined();
  fireEvent.click(within(match!).getByTestId(TEST_IDS.adminRuleOpen));
  await screen.findByTestId(TEST_IDS.adminRulePanel, {}, WAIT);
}

function transitionLabels(): readonly string[] {
  return within(screen.getByTestId(TEST_IDS.adminRuleLifecycle))
    .getAllByTestId(TEST_IDS.adminRuleTransition)
    .map((button) => button.textContent);
}

/** Choose a member and run the dry run the activation gate demands. */
async function runDryRun(): Promise<void> {
  fireIonChange(screen.getByTestId(TEST_IDS.adminRuleSimulateMember), 'mem-omar');
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.adminRuleSimulateRun)).toBeEnabled();
  }, WAIT);
  fireEvent.click(screen.getByTestId(TEST_IDS.adminRuleSimulateRun));
}

/** Fire the first lifecycle action the open rule offers. */
function clickFirstTransition(): void {
  fireEvent.click(
    within(screen.getByTestId(TEST_IDS.adminRuleLifecycle)).getByTestId(
      TEST_IDS.adminRuleTransition,
    ),
  );
}

/** The approved rule version a transition handler answers with. */
function approvedRuleResponse(ruleKey: string): Record<string, unknown> {
  return {
    ruleId: MOCK_ADMIN.draftRuleId,
    teamId: MOCK_ADMIN.teamId,
    seasonId: null,
    ruleKey,
    version: 3,
    name: 'Points rule v3',
    description: null,
    status: 'approved',
    pointEntries: [],
    effectiveFrom: null,
    effectiveTo: null,
    recordVersion: 2,
    publishedAt: null,
    retiredAt: null,
    updatedAt: MOCK_ADMIN.asOf,
  };
}

registerIntegrationSession();

describe('the rule list is versioned and filterable', () => {
  it('lists every version with its lifecycle state', async () => {
    await openRules();

    const rows = screen.getAllByTestId(TEST_IDS.adminRuleRow);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Draft');
    expect(rows[2]).toHaveTextContent('Published');
  });

  it('narrows to one lifecycle state and offers the designed no-matches state', async () => {
    await openRules();

    fireIonChange(screen.getByTestId(TEST_IDS.adminRulesStatusSelect), 'published');
    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.adminRuleRow)).toHaveLength(1);
    }, WAIT);

    fireIonChange(screen.getByTestId(TEST_IDS.adminRulesStatusSelect), 'retired');
    expect(await screen.findByText('No rules match', {}, WAIT)).toBeInTheDocument();
  });

  it('switches between the two governed families and clears the open rule', async () => {
    await openRules();
    await openRule('Points rule v3');

    fireIonChange(screen.getByTestId(TEST_IDS.adminRulesFamilySelect), 'calculation');

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.adminRulePanel)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('renders an unscored category as "not scored", never as zero', async () => {
    await openRules();
    await openRule('Points rule v3');

    const entries = screen.getByTestId(TEST_IDS.adminRuleEntries);
    expect(entries).toHaveTextContent('Not scored');
    expect(entries).toHaveTextContent('10 points');
  });
});

describe('activation requires a dry run first', () => {
  it('offers only approve from a draft', async () => {
    await openRules();
    await openRule('Points rule v3');

    expect(transitionLabels()).toEqual(['Approve']);
  });

  it('blocks publish until a simulation has been seen, and says why', async () => {
    await openRules();
    await openRule('Points rule v2');

    const publish = within(screen.getByTestId(TEST_IDS.adminRuleLifecycle))
      .getAllByTestId(TEST_IDS.adminRuleTransition)
      .find((button) => button.textContent === 'Publish');

    expect(publish).toHaveProperty('disabled', true);
    expect(screen.getByTestId(TEST_IDS.adminRuleLifecycle)).toHaveTextContent(
      'Run a simulation before publishing',
    );
  });

  it('requires a member before the dry run may start', async () => {
    await openRules();
    await openRule('Points rule v2');

    expect(screen.getByTestId(TEST_IDS.adminRuleSimulateRun)).toBeDisabled();
    expect(screen.getByTestId(TEST_IDS.adminRuleSimulation)).toHaveTextContent(
      'Choose a member first',
    );
  });

  it('says the rule has not been simulated before any dry run', async () => {
    await openRules();
    await openRule('Points rule v2');

    expect(screen.getByTestId(TEST_IDS.adminRuleSimulateResult)).toHaveTextContent(
      'Not simulated yet',
    );
  });

  it('unlocks publish once a dry run has compared draft against published', async () => {
    await openRules();
    await openRule('Points rule v2');

    await runDryRun();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRuleSimulateResult)).toHaveTextContent('Difference');
    }, WAIT);

    const publish = within(screen.getByTestId(TEST_IDS.adminRuleLifecycle))
      .getAllByTestId(TEST_IDS.adminRuleTransition)
      .find((button) => button.textContent === 'Publish');
    expect(publish).toHaveProperty('disabled', false);
  });
});

describe('lifecycle transitions carry optimistic concurrency', () => {
  it('sends the expected record version with the transition', async () => {
    let submitted: unknown = null;
    mockApiServer.use(
      http.post(apiUrl('/teams/:teamId/points-rules/:ruleId/transition'), async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json(approvedRuleResponse('calc.v3'));
      }),
    );
    await openRules();
    await openRule('Points rule v3');

    clickFirstTransition();

    await waitFor(() => {
      expect(submitted).toEqual({ transition: 'approve', expectedRecordVersion: 1 });
    }, WAIT);
  });

  it('moves a draft to approved through the real endpoint', async () => {
    await openRules();
    await openRule('Points rule v3');

    clickFirstTransition();

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.adminRuleRow)[0]).toHaveTextContent('Approved');
    }, WAIT);
  });
});

describe('designed states', () => {
  it('renders the designed forbidden state without a rule-management grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute(APP_PATHS.adminRules, APP_PATHS.adminRules, <AdminRulesContainer />);

    expect(await screen.findByTestId(TEST_IDS.adminRulesForbidden, {}, WAIT)).toBeInTheDocument();
  });

  it('renders the designed empty state when the team has no rule versions', async () => {
    mockApiServer.use(
      http.get(apiUrl('/teams/:teamId/points-rules'), () =>
        HttpResponse.json({ items: [], total: 0, limit: 50, offset: 0 }),
      ),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(APP_PATHS.adminRules, APP_PATHS.adminRules, <AdminRulesContainer />);

    expect(await screen.findByTestId(TEST_IDS.adminRulesEmpty, {}, WAIT)).toBeInTheDocument();
  });
});

describe('the calculation family shares the same governance', () => {
  it('transitions a calculation rule through its own endpoint', async () => {
    let calledPath: string | null = null;
    mockApiServer.use(
      http.post(apiUrl('/teams/:teamId/calculation-rules/:ruleId/transition'), ({ request }) => {
        calledPath = new URL(request.url).pathname;
        return HttpResponse.json(approvedRuleResponse('points.v3'));
      }),
    );
    await openRules();

    fireIonChange(screen.getByTestId(TEST_IDS.adminRulesFamilySelect), 'calculation');
    await screen.findAllByTestId(TEST_IDS.adminRuleRow, {}, WAIT);
    await openRule('Points rule v3');
    clickFirstTransition();

    await waitFor(() => {
      expect(calledPath).toContain('/calculation-rules/');
    }, WAIT);
  });

  it('reports a rejected transition without losing the rule list', async () => {
    mockApiServer.use(
      http.post(apiUrl('/teams/:teamId/points-rules/:ruleId/transition'), () =>
        HttpResponse.json({ bad: true }, { status: 409 }),
      ),
    );
    await openRules();
    await openRule('Points rule v3');

    clickFirstTransition();

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.adminRuleRow)[0]).toHaveTextContent('Draft');
    }, WAIT);
  });

  it('reports a failed dry run and leaves publish blocked', async () => {
    mockApiServer.use(
      http.post(apiUrl('/teams/:teamId/calculation-rules/:ruleId/simulate'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );
    await openRules();
    await openRule('Points rule v2');

    await runDryRun();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRuleSimulateResult)).toHaveTextContent(
        'Not simulated yet',
      );
    }, WAIT);
    const publish = within(screen.getByTestId(TEST_IDS.adminRuleLifecycle))
      .getAllByTestId(TEST_IDS.adminRuleTransition)
      .find((button) => button.textContent === 'Publish');
    expect(publish).toHaveProperty('disabled', true);
  });
});

describe('a failed read offers a retry', () => {
  it('re-issues the rule list from the designed error state', async () => {
    const attempts = await retryFromErrorState({
      path: '/teams/:teamId/points-rules',
      errorTestId: TEST_IDS.adminRulesError,
      signIn: async () => {
        await signInAs(MOCK_PERSONA_EMAILS.admin);
      },
      render: () => {
        renderRoute(APP_PATHS.adminRules, APP_PATHS.adminRules, <AdminRulesContainer />);
      },
    });

    expect(attempts.after).toBeGreaterThan(attempts.before);
  });
});
