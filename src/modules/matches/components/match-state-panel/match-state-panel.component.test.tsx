import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MatchStatePanel } from './match-state-panel.component';

describe('MatchStatePanel', () => {
  it('routes the transition the coach picked and keeps the rest disabled', () => {
    const onTransition = vi.fn();
    render(
      <MatchStatePanel
        view={{
          heading: 'Match state',
          intro: 'The server owns the state machine.',
          buttons: [
            { transition: 'pause', label: 'Pause', disabled: false },
            { transition: 'start', label: 'Start match', disabled: true },
          ],
          isRunning: false,
          onTransition,
        }}
      />,
    );

    fireEvent.click(screen.getByTestId(`${TEST_IDS.scoreboardTransition}-pause`));

    // Ionic marks a disabled ion-button with the disabled property; the
    // native :disabled pseudo-state does not apply to a custom element.
    const illegal = screen.getByTestId(`${TEST_IDS.scoreboardTransition}-start`);
    expect(onTransition.mock.calls).toStrictEqual([['pause']]);
    expect((illegal as unknown as { disabled: boolean }).disabled).toBe(true);
  });
});
