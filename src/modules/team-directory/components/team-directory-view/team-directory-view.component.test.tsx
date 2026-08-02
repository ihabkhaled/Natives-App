import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildTeamDirectoryScreenView } from '../../../../../tests/factories/team-directory-view.factory';
import { getLinkHref, getMetaContent } from '../../../../../tests/setup/head-meta.helper';
import type { TeamDirectoryViewProps } from './team-directory-view.types';
import { TeamDirectoryView } from './team-directory-view.component';

function renderView(overrides: Partial<TeamDirectoryViewProps> = {}): ReturnType<typeof render> {
  return render(<TeamDirectoryView {...buildTeamDirectoryScreenView(overrides)} />);
}

describe('TeamDirectoryView', () => {
  it('renders the public team page with its hero', () => {
    renderView();

    expect(screen.getByTestId(TEST_IDS.teamDirectoryPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.teamDirectoryHero)).toBeInTheDocument();
  });

  it('publishes distinct SEO metadata for the route', () => {
    renderView();

    expect(document.title).toBe('Our Team — Ultimate Natives');
    expect(getLinkHref('link[rel="canonical"]')).toContain('/team');
    expect(getMetaContent('meta[property="og:title"]')).toBe('Our Team — Ultimate Natives');
    expect(getMetaContent('meta[name="description"]')).toBe('Meet Ultimate Natives.');
  });

  it('shows the honest seam notice while the endpoint is not live', () => {
    renderView();

    expect(screen.getByTestId(TEST_IDS.teamDirectorySeamNotice)).toHaveTextContent(
      'Photos and the full roster are on their way',
    );
  });

  it('drops the seam notice once the endpoint is live', () => {
    renderView({ isEndpointLive: true });

    expect(screen.queryByTestId(TEST_IDS.teamDirectorySeamNotice)).not.toBeInTheDocument();
  });

  it('renders the leadership groups and the roster when ready', () => {
    renderView();

    expect(screen.getByTestId(TEST_IDS.teamDirectoryStaffGroup)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.teamDirectoryRoster)).toBeInTheDocument();
    expect(screen.getByText('1 players listed so far')).toBeInTheDocument();
  });

  it('shows the skeleton instead of the sections while loading', () => {
    renderView({ status: 'loading' });

    expect(screen.getByTestId(TEST_IDS.teamDirectoryLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.teamDirectoryRoster)).not.toBeInTheDocument();
  });

  it('shows the designed error state with a retry action', () => {
    renderView({ status: 'error' });

    expect(screen.getByTestId(TEST_IDS.teamDirectoryError)).toHaveTextContent(
      'Something went wrong on our side.',
    );
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('shows the designed empty state when the directory publishes nobody', () => {
    renderView({ status: 'empty', staffGroups: [], rosterCards: [] });

    expect(screen.getByTestId(TEST_IDS.teamDirectoryEmpty)).toHaveTextContent(
      'The directory is not published yet',
    );
  });

  it('shows the offline state rather than an empty page when disconnected', () => {
    renderView({ status: 'offline' });

    expect(screen.getByTestId(TEST_IDS.teamDirectoryOffline)).toBeInTheDocument();
  });
});
