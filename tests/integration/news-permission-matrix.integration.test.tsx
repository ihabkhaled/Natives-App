import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GuardedRoute } from '@/app/router/guarded-route.guard';
import { selectVisibleNavItems } from '@/app/shell/navigation/nav-visibility.helper';
import { getNewsRouteDefinitions } from '@/modules/news';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { registerIntegrationSession } from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

const EDITOR_AFFORDANCES = [
  TEST_IDS.newsEditorForm,
  TEST_IDS.newsEditorList,
  TEST_IDS.newsEditorNewDraft,
  TEST_IDS.newsEditorRowEdit,
  TEST_IDS.newsEditorRowPublish,
  TEST_IDS.newsEditorSubmit,
  TEST_IDS.newsEditorTitleInput,
  TEST_IDS.newsEditorBodyInput,
];

function newsRoute(path: string) {
  const definition = getNewsRouteDefinitions().find((route) => route.path === path);
  if (definition === undefined) {
    throw new Error(`news route ${path} is not registered`);
  }
  return definition;
}

function renderNewsRoute(path: string, pattern = path): void {
  renderRoute(path, pattern, <GuardedRoute definition={newsRoute(pattern)} />);
}

registerIntegrationSession();

/**
 * The permission matrix for the newsroom, driven end to end through MSW:
 * `/auth/me` and `/rbac/me/permissions` answer with the signed-in persona's
 * real grants, and the route guard decides from those alone.
 */
describe('the newsroom editor is gated on news.manage', () => {
  it('opens the editor for a coach, who holds the grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderNewsRoute(APP_PATHS.newsManage);

    await screen.findByTestId(TEST_IDS.newsEditorPage, {}, WAIT);
    expect(await screen.findByTestId(TEST_IDS.newsEditorForm, {}, WAIT)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.newsEditorNewDraft)).toBeInTheDocument();
  });

  it('forbids the editor route for a plain member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderNewsRoute(APP_PATHS.newsManage);

    expect(await screen.findByTestId(TEST_IDS.guardForbidden, {}, WAIT)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.newsEditorPage)).not.toBeInTheDocument();
  });

  it('shows a plain member ZERO editing affordances on the editor route', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderNewsRoute(APP_PATHS.newsManage);

    await screen.findByTestId(TEST_IDS.guardForbidden, {}, WAIT);
    for (const affordance of EDITOR_AFFORDANCES) {
      expect(screen.queryByTestId(affordance)).not.toBeInTheDocument();
    }
  });

  it('never offers a plain member the newsroom link on the public list', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderNewsRoute(APP_PATHS.news);

    await screen.findByTestId(TEST_IDS.newsPage, {}, WAIT);
    expect(screen.queryByText('Newsroom')).not.toBeInTheDocument();
  });

  it('offers the newsroom link on the public list to a coach', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderNewsRoute(APP_PATHS.news);

    await screen.findByTestId(TEST_IDS.newsPage, {}, WAIT);
    expect(await screen.findByText('Newsroom', {}, WAIT)).toBeInTheDocument();
  });

  it('keeps the newsroom destination out of a membersidebar entirely', () => {
    const memberItems = selectVisibleNavItems(getNewsRouteDefinitions(), {
      permissions: [PERMISSIONS.matchRead, PERMISSIONS.practicesRead],
      hasTeamContext: true,
    });
    const editorItems = selectVisibleNavItems(getNewsRouteDefinitions(), {
      permissions: [PERMISSIONS.newsManage],
      hasTeamContext: true,
    });

    expect(memberItems).toEqual([]);
    expect(editorItems.map((item) => item.key)).toEqual(['news-manage']);
  });
});

describe('the public newsroom needs no session at all', () => {
  it('renders the list for a signed-out visitor', async () => {
    renderNewsRoute(APP_PATHS.news);

    expect(await screen.findByTestId(TEST_IDS.newsPage, {}, WAIT)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.guardForbidden)).not.toBeInTheDocument();
  });

  it('states honestly that the newsroom is not connected yet', async () => {
    renderNewsRoute(APP_PATHS.news);

    expect(await screen.findByTestId(TEST_IDS.newsEmpty, {}, WAIT)).toHaveTextContent(
      'The newsroom is almost ready',
    );
  });

  it('renders one story route without a session and says the story is missing', async () => {
    renderNewsRoute('/news/first-league-win', APP_PATHS.newsArticle);

    expect(await screen.findByTestId(TEST_IDS.newsArticlePage, {}, WAIT)).toBeInTheDocument();
    expect(await screen.findByTestId(TEST_IDS.newsArticleEmpty, {}, WAIT)).toHaveTextContent(
      'We could not find that story',
    );
  });
});
