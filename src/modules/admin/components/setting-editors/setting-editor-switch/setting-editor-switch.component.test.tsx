import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SETTING_KEYS } from '@/modules/admin/constants/admin.constants';
import { bindSettingEditor, emptySettingValue } from '@/modules/admin/helpers/setting-draft.helper';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import { SettingEditorSwitch } from './setting-editor-switch.component';

const EDITOR_MARKERS: Record<string, string> = {
  attendance_statuses: 'settingEditors.statusesAdd',
  session_types: 'settingEditors.typesAdd',
  attendance_weights: 'settingEditors.weightsBlocked',
  assessment_scale: 'settingEditors.bandsAdd',
  badge_tiers: 'settingEditors.tiersAdd',
  roster_limits: 'settingEditors.squadFloorHint',
  notification_rules: 'settingEditors.quietHoursUse',
  report_branding: 'settingEditors.previewHeading',
};

describe('SettingEditorSwitch', () => {
  it.each(SETTING_KEYS)('routes %s to its typed editor', (key) => {
    const context = buildTestEditorContext(
      key === 'attendance_weights'
        ? {
            weights: {
              rows: [],
              blockedNotice: 'settingEditors.weightsBlocked',
              loadingNotice: null,
            },
          }
        : {},
    );
    const { unmount } = render(
      <SettingEditorSwitch
        binding={bindSettingEditor(key, emptySettingValue(key), vi.fn())}
        context={context}
      />,
    );

    expect(screen.getByText(EDITOR_MARKERS[key]!)).toBeInTheDocument();
    unmount();
  });
});
