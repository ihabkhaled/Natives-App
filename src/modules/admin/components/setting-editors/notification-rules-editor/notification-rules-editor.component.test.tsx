import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { NotificationRulesValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import {
  fireIonChange,
  fireIonCheckboxChangeFromLabel,
  fireIonInput,
} from '../../../../../../tests/setup/ionic-events.helper';
import { NotificationRulesEditor } from './notification-rules-editor.component';

const VALUE: NotificationRulesValue = {
  rules: [
    {
      event: 'practice_reminder',
      enabled: true,
      channels: ['push'],
      leadHours: 24,
      recipients: 'members',
    },
  ],
};

function mountEditor(onChange = vi.fn(), value: NotificationRulesValue = VALUE) {
  render(
    <NotificationRulesEditor
      value={value}
      onChange={onChange}
      context={buildTestEditorContext()}
    />,
  );
  return onChange;
}

function toggleIn(card: HTMLElement, label: string, checked: boolean): void {
  fireIonCheckboxChangeFromLabel(within(card).getByText(label), checked);
}

describe('NotificationRulesEditor', () => {
  it('renders one card per canonical event, defaults filled', () => {
    mountEditor();

    expect(screen.getAllByTestId('admin-editor-row')).toHaveLength(4);
    expect(screen.getByText('settingEditors.eventBadgeAwarded')).toBeInTheDocument();
  });

  it('offers the lead time only on the practice reminder', () => {
    mountEditor();

    expect(screen.getByTestId('admin-editor-row-lead-hours')).toHaveValue('24');
    expect(screen.getAllByTestId('admin-editor-row-lead-hours')).toHaveLength(1);
  });

  it('toggles a channel while keeping the push-then-email order', () => {
    const onChange = mountEditor();

    toggleIn(screen.getAllByTestId('admin-editor-row')[0]!, 'settingEditors.channelEmail', true);

    const next = onChange.mock.calls[0]?.[0] as NotificationRulesValue;
    expect(next.rules[0]?.channels).toEqual(['push', 'email']);
  });

  it('enables another event without disturbing the reminder', () => {
    const onChange = mountEditor();

    toggleIn(screen.getAllByTestId('admin-editor-row')[1]!, 'settingEditors.enabled', true);

    const next = onChange.mock.calls[0]?.[0] as NotificationRulesValue;
    expect(next.rules[1]?.enabled).toBe(true);
    expect(next.rules[0]?.enabled).toBe(true);
  });

  it('re-targets recipients through the select', () => {
    const onChange = mountEditor();

    fireIonChange(screen.getByTestId('admin-editor-row-recipients-practice_reminder'), 'staff');

    const next = onChange.mock.calls[0]?.[0] as NotificationRulesValue;
    expect(next.rules[0]?.recipients).toBe('staff');
  });

  it('patches the lead time as an integer', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-lead-hours'), '12');

    const next = onChange.mock.calls[0]?.[0] as NotificationRulesValue;
    expect(next.rules[0]?.leadHours).toBe(12);
  });

  it('enables quiet hours with the overnight default', () => {
    const onChange = mountEditor();

    fireIonCheckboxChangeFromLabel(screen.getByText('settingEditors.quietHoursUse'), true);

    const withQuiet = onChange.mock.calls[0]?.[0] as NotificationRulesValue;
    expect(withQuiet.quietHours).toEqual({ start: '22:00', end: '07:00' });
  });

  it('shows the overnight explainer and edits both quiet bounds', () => {
    const onChange = mountEditor(vi.fn(), {
      ...VALUE,
      quietHours: { start: '22:00', end: '07:00' },
    });

    expect(screen.getByText('settingEditors.quietOvernight')).toBeInTheDocument();
    fireIonInput(screen.getByTestId('admin-setting-editor-quiet-start'), '23:00');
    fireIonInput(screen.getByTestId('admin-setting-editor-quiet-end'), '06:30');

    expect((onChange.mock.calls[0]?.[0] as NotificationRulesValue).quietHours?.start).toBe('23:00');
    expect((onChange.mock.calls[1]?.[0] as NotificationRulesValue).quietHours?.end).toBe('06:30');
  });

  it('drops a channel when its toggle is cleared', () => {
    const onChange = mountEditor();

    toggleIn(screen.getAllByTestId('admin-editor-row')[0]!, 'settingEditors.channelPush', false);

    const next = onChange.mock.calls[0]?.[0] as NotificationRulesValue;
    expect(next.rules[0]?.channels).toEqual([]);
  });
});
