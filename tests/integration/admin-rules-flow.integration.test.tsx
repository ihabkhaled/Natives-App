import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AdminRulesContainer } from '@/modules/admin/containers/admin-rules.container';
import { getEnvironment } from '@/packages/environment';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_ADMIN } from '@/tests/msw/admin.fixture';
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

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

async function openRules(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminRules, APP_PATHS.adminRules, <AdminRulesContainer />);
  await screen.findAllByTestId(TEST_IDS.adminRuleRow, {}, WAIT);
}

/** Open the rule whose name identifies its lifecycle state. */
async function openRule(name: string): Promise<void> {
  const rows = screen.getAllByTestId(TEST_IDS.adminRuleRow);
  const match = rows.find((row) => row.textContent?.includes(name));
  expect(match).toBeDefined();
  fireEvent.click(within(match!).getByTestId(TEST_IDS.adminRuleOpen));
  await screen.findByTestId(TEST_IDS.adminRulePanel, {}, WAIT);
}

function transitionLabels(): readonly string[] {
  return within(screen.getByTestId(TEST_IDS.adminRuleLifecycle))
    .getAllByTestId(TEST_IDS.adminRuleTransition)
    .map((button) => button.textContent ?? '');
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

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

    fireIonChange(screen.getByTestId(TEST_IDS.adminRuleSimulateMember), 'mem-omar');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRuleSimulateRun)).toBeEnabled();
    }, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.adminRuleSimulateRun));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRuleSimulateResult)).toHaveTextContent(
        'Difference',
      );
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
        return HttpResponse.json({
          ruleId: MOCK_ADMIN.draftRuleId,
          teamId: MOCK_ADMIN.teamId,
          seasonId: null,
          ruleKey: 'points.v3',
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
        });
      }),
    );
    await openRules();
    await openRule('Points rule v3');

    fireEvent.click(within(screen.getByTestId(TEST_IDS.adminRuleLifecycle)).getByTestId(
      TEST_IDS.adminRuleTransition,
    ));

    await waitFor(() => {
      expect(submitted).toEqual({ transition: 'approve', expectedRecordVersion: 1 });
    }, WAIT);
  });

  it('moves a draft to approved through the real endpoint', async () => {
    await openRules();
    await openRule('Points rule v3');

    fireEvent.click(within(screen.getByTestId(TEST_IDS.adminRuleLifecycle)).getByTestId(
      TEST_IDS.adminRuleTransition,
    ));

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
