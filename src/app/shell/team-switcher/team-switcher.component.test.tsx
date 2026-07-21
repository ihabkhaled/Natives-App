import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { buildTeamSwitcherView } from '../../../../tests/factories/app-bar-view.factory';
import { TeamSwitcher } from './team-switcher.component';

const OPTIONS = [
  { teamId: 'team-1', name: 'Ultimate Natives', detail: 'Season 2026', isActive: true },
  { teamId: 'team-2', name: 'Natives Reserve', detail: null, isActive: false },
];

function renderSwitcher(
  overrides: Partial<React.ComponentProps<typeof TeamSwitcher>> = {},
): React.ComponentProps<typeof TeamSwitcher> {
  const props = buildTeamSwitcherView({ isAvailable: true, options: OPTIONS, ...overrides });
  render(<TeamSwitcher {...props} />);
  return props;
}

describe('TeamSwitcher', () => {
  it('renders nothing for a single-team principal rather than a dead control', () => {
    const { container } = render(<TeamSwitcher {...buildTeamSwitcherView()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('names the active scope and announces the control', () => {
    renderSwitcher();

    const toggle = screen.getByTestId('team-switcher-toggle');
    expect(toggle).toHaveAccessibleName('Switch the team you are working in');
    expect(toggle).toHaveAttribute('aria-haspopup', 'listbox');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveTextContent('Ultimate Natives');
  });

  it('keeps the option list out of the accessibility tree while collapsed', () => {
    renderSwitcher();

    expect(screen.getByTestId('team-switcher-menu')).toHaveAttribute('hidden');
  });

  it('lists every team with the current one selected once open', () => {
    renderSwitcher({ isOpen: true });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Season 2026')).toBeInTheDocument();
  });

  it('reports the chosen team', async () => {
    const onSelect = vi.fn();
    renderSwitcher({ isOpen: true, onSelect });

    await userEvent.click(screen.getByTestId('team-switcher-option-team-2'));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('team-2');
  });

  it('reports a toggle request', async () => {
    const onToggle = vi.fn();
    renderSwitcher({ onToggle });

    await userEvent.click(screen.getByTestId('team-switcher-toggle'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
