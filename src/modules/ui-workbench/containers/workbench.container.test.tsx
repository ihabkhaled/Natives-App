import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { WORKBENCH_BUTTONS_TEST_ID } from '../components/workbench-buttons/workbench-buttons.constants';
import { WORKBENCH_FORM_TEST_IDS } from '../components/workbench-form/workbench-form.constants';
import { WORKBENCH_LIST_TEST_IDS } from '../components/workbench-list/workbench-list.constants';
import { WORKBENCH_STATES_TEST_ID } from '../components/workbench-states/workbench-states.constants';
import { buildWorkbenchItems } from '../helpers/workbench-items.helper';
import { useWorkbenchScreen, type WorkbenchScreenView } from '../hooks/use-workbench-screen.hook';
import { WorkbenchContainer } from './workbench.container';

vi.mock('../hooks/use-workbench-screen.hook', () => ({ useWorkbenchScreen: vi.fn() }));

const onStateRetryDemo = vi.fn();
const onSubmit = vi.fn();

function buildScreen(overrides: Partial<WorkbenchScreenView> = {}): WorkbenchScreenView {
  return {
    title: 'UI Workbench',
    buttonsSection: 'Buttons',
    buttonPrimary: 'Primary action',
    buttonSecondary: 'Secondary action',
    buttonDanger: 'Destructive action',
    formSection: 'Form',
    formNameLabel: 'Name',
    formEmailLabel: 'Email',
    formSubmit: 'Submit',
    formSuccessMessage: undefined,
    form: {
      name: {
        name: 'name',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        errorMessage: undefined,
      },
      email: {
        name: 'email',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        errorMessage: undefined,
      },
      submittedName: undefined,
      onSubmit,
    },
    statesSection: 'States',
    stateLabels: {
      loading: 'Loading…',
      emptyTitle: 'Nothing here yet',
      emptyMessage: 'There is no content to show right now.',
      errorTitle: 'Something went wrong',
      retry: 'Try again',
      offlineTitle: 'You are offline',
      offlineMessage: 'Reconnect to load the latest data.',
      permissionTitle: 'Permission needed',
      permissionMessage: 'Grant the required permission to use this feature.',
    },
    onStateRetryDemo,
    listSection: 'Virtualized list',
    items: buildWorkbenchItems(3, (index) => `Item ${String(index)}`),
    ...overrides,
  };
}

function renderContainer(overrides: Partial<WorkbenchScreenView> = {}): void {
  vi.mocked(useWorkbenchScreen).mockReturnValue(buildScreen(overrides));
  render(<WorkbenchContainer />);
}

beforeEach(() => {
  vi.mocked(useWorkbenchScreen).mockReturnValue(buildScreen());
});

afterEach(() => {
  vi.clearAllMocks();
});

function getIonTitle(): Element | null {
  return document.body.querySelector('ion-title');
}

function getErrorStateRetryButton(): Element {
  return document.body.querySelector(`[data-testid="${TEST_IDS.errorState}"] ion-button`)!;
}

describe('WorkbenchContainer', () => {
  it('renders the workbench page shell with the screen title', () => {
    renderContainer();

    expect(screen.getByTestId(TEST_IDS.workbenchPage)).toBeInTheDocument();
    expect(getIonTitle()).toHaveTextContent('UI Workbench');
  });

  it('composes every workbench section', () => {
    renderContainer();

    expect(screen.getByTestId(WORKBENCH_BUTTONS_TEST_ID)).toBeInTheDocument();
    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.section)).toBeInTheDocument();
    expect(screen.getByTestId(WORKBENCH_STATES_TEST_ID)).toBeInTheDocument();
    expect(screen.getByTestId(WORKBENCH_LIST_TEST_IDS.list)).toBeInTheDocument();
  });

  it('feeds the section headings from the screen hook', () => {
    renderContainer();

    expect(screen.getByRole('heading', { level: 2, name: 'Buttons' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Form' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'States' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Virtualized list' })).toBeInTheDocument();
  });

  it('feeds the button labels from the screen hook', () => {
    renderContainer();

    expect(screen.getByText('Primary action')).toBeInTheDocument();
    expect(screen.getByText('Secondary action')).toBeInTheDocument();
    expect(screen.getByText('Destructive action')).toBeInTheDocument();
  });

  it('wires the form bindings and submit handler', async () => {
    renderContainer();

    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.name)).toHaveAttribute('label', 'Name');
    await userEvent.click(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.submit));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('passes the success message through to the form section', () => {
    renderContainer({ formSuccessMessage: 'Submitted as Ranger' });

    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.result)).toHaveTextContent(
      'Submitted as Ranger',
    );
  });

  it('wires the retry demo into the error state', async () => {
    renderContainer();

    await userEvent.click(getErrorStateRetryButton());

    expect(onStateRetryDemo).toHaveBeenCalledOnce();
  });

  it('shares the empty title between the states section and the list', () => {
    renderContainer({ items: [] });

    expect(screen.getAllByTestId(TEST_IDS.emptyState)).toHaveLength(2);
  });
});
