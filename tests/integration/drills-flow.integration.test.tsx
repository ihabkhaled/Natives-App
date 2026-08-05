import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DrillDetailContainer } from '@/modules/drills/containers/drill-detail.container';
import { DrillsCatalogueContainer } from '@/modules/drills/containers/drills-catalogue.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_DRILLS } from '@/tests/msw/drills.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { confirmResult } from '../setup/confirm-alert-stub.helper';
import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange, fireIonInput } from '../setup/ionic-events.helper';
import { renderRoute } from '../setup/render-with-providers.helper';

/**
 * Archiving confirms through an Ionic alert overlay jsdom cannot drive, so
 * only the confirmation is stubbed here; the mutation, service, gateway, and
 * MSW handler underneath all run for real.
 */
vi.mock('@/shared/ui', async (importOriginal) => {
  const stub = await import('../setup/confirm-alert-stub.helper');
  return stub.withConfirmStub(await importOriginal<Record<string, unknown>>());
});

const WAIT = { timeout: 5000 };

function renderList(): void {
  renderRoute('/drills', '/drills', <DrillsCatalogueContainer />);
}

function renderDetail(drillId: string): void {
  renderRoute(`/drills/${drillId}`, '/drills/:drillId', <DrillDetailContainer />);
}

beforeEach(async () => {
  confirmResult.value = true;
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('drills catalogue (browse and search, live endpoints)', () => {
  it('lists both an active and an archived drill, distinguishably', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderList();

    await screen.findByTestId(TEST_IDS.drillsList, {}, WAIT);

    const cards = screen.getAllByTestId(TEST_IDS.drillCard);
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Give-and-go break')).toBeInTheDocument();
    expect(screen.getByText('Zone breakdown')).toBeInTheDocument();
    // Two distinct status chips prove the archived drill did not vanish —
    // it renders through the same card, only its chip differs.
    expect(screen.getAllByTestId(TEST_IDS.drillStatusChip)).toHaveLength(2);
  });

  it('narrows the list as the coach types a search', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderList();
    await screen.findByTestId(TEST_IDS.drillsList, {}, WAIT);

    fireIonInput(screen.getByTestId(TEST_IDS.drillsSearch), 'zone');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.drillCard)).toHaveLength(1);
    });
    expect(screen.getByText('Zone breakdown')).toBeInTheDocument();
    expect(screen.queryByText('Give-and-go break')).not.toBeInTheDocument();
  });

  it('narrows the list by the status filter, keeping the archived drill reachable', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderList();
    await screen.findByTestId(TEST_IDS.drillsList, {}, WAIT);

    fireIonChange(screen.getByTestId(TEST_IDS.drillsStatusFilter), 'archived');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.drillCard)).toHaveLength(1);
    });
    expect(screen.getByText('Zone breakdown')).toBeInTheDocument();
  });

  it('withholds the catalogue from a member without drill.manage', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderList();

    await screen.findByTestId(TEST_IDS.drillsForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.drillsList)).not.toBeInTheDocument();
  });
});

describe('drill detail: create, edit and archive (live endpoints)', () => {
  it('creates a drill and lands on its own detail screen', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail('new');

    await screen.findByTestId(TEST_IDS.drillForm, {}, WAIT);

    fireIonInput(screen.getByTestId(TEST_IDS.drillNameInput), 'Deep cut ladder');
    fireIonChange(screen.getByTestId(TEST_IDS.drillCategorySelect), 'cutting');
    fireEvent.click(screen.getByTestId(TEST_IDS.drillSaveButton));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.drillDetailView)).toHaveAttribute(
        'aria-label',
        'Deep cut ladder',
      );
    });
    // A freshly created drill is active and offers the archive control — the
    // create-mode screen (no chip, no lifecycle) is gone.
    expect(screen.getByTestId(TEST_IDS.drillStatusChip)).toHaveTextContent('Active');
    expect(screen.getByTestId(TEST_IDS.drillArchiveButton)).toBeInTheDocument();
  });

  it('loads an existing drill and saves an edit to it', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail(MOCK_DRILLS.activeId);

    await screen.findByTestId(TEST_IDS.drillForm, {}, WAIT);
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.drillNameInput)).toHaveValue('Give-and-go break');
    });

    fireIonInput(screen.getByTestId(TEST_IDS.drillNameInput), 'Give-and-go break v2');
    fireEvent.click(screen.getByTestId(TEST_IDS.drillSaveButton));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.drillDetailView)).toHaveAttribute(
        'aria-label',
        'Give-and-go break v2',
      );
    });
  });

  it('archives a drill and replaces the control with a plain, honest notice', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail(MOCK_DRILLS.activeId);

    await screen.findByTestId(TEST_IDS.drillArchiveButton, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.drillArchiveButton));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.drillStatusChip)).toHaveTextContent('Archived');
    });
    expect(screen.queryByTestId(TEST_IDS.drillArchiveButton)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillArchivedNotice)).toHaveTextContent('archived');
    // Never "deleted": the record and the form stay fully visible.
    expect(screen.queryByText(/deleted|removed/i)).not.toBeInTheDocument();
  });

  it('changes nothing when the coach backs out of the archive confirmation', async () => {
    confirmResult.value = false;
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderDetail(MOCK_DRILLS.activeId);

    await screen.findByTestId(TEST_IDS.drillArchiveButton, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.drillArchiveButton));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.drillStatusChip)).toHaveTextContent('Active');
    });
  });

  it('withholds the detail screen from a member without drill.manage', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDetail(MOCK_DRILLS.activeId);

    await screen.findByTestId(TEST_IDS.drillDetailForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.drillForm)).not.toBeInTheDocument();
  });
});
