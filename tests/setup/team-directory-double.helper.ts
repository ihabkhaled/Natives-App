import { vi } from 'vitest';

import { requestPublicTeamDirectory } from '@/modules/team-directory';
import { MOCK_TEAM_DIRECTORY } from '@/tests/msw/team-directory.fixture';

/**
 * Resets the public-directory gateway double to the shared fixture.
 *
 * Every public surface — the landing teasers, `/team`, and the competitions
 * showcase — reads the one public directory endpoint, so their specs would
 * otherwise each repeat this mock. Pair with `mockTeamDirectoryModule()`,
 * which must be called at module scope so vitest can hoist it.
 */
export function resetTeamDirectoryDouble(): void {
  vi.mocked(requestPublicTeamDirectory).mockResolvedValue(MOCK_TEAM_DIRECTORY);
}
