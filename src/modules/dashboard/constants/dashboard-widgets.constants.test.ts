import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import {
  DASHBOARD_PERSONA_TITLE_KEYS,
  DASHBOARD_WIDGET_KIND,
  DASHBOARD_WIDGET_REGISTRY,
} from './dashboard-widgets.constants';

describe('dashboard widget registry', () => {
  it('registers every widget kind with a translated title', () => {
    for (const kind of Object.values(DASHBOARD_WIDGET_KIND)) {
      const descriptor = DASHBOARD_WIDGET_REGISTRY[kind];
      expect(descriptor).toBeDefined();
      expect(descriptor?.titleKey).toMatch(/^dashboard\./u);
    }
  });

  it('leaves member-visible widgets ungated and privileged widgets permission-gated', () => {
    expect(
      DASHBOARD_WIDGET_REGISTRY[DASHBOARD_WIDGET_KIND.memberAttendance]?.permission,
    ).toBeNull();
    expect(DASHBOARD_WIDGET_REGISTRY[DASHBOARD_WIDGET_KIND.adminLifecycle]?.permission).toBe(
      PERMISSIONS.memberLifecycleManage,
    );
    expect(DASHBOARD_WIDGET_REGISTRY[DASHBOARD_WIDGET_KIND.coachAttention]?.permission).toBe(
      PERMISSIONS.attendanceMark,
    );
  });

  it('uses stable kebab-case identifiers so the test id and wire stay aligned', () => {
    for (const kind of Object.values(DASHBOARD_WIDGET_KIND)) {
      const segments = kind.split('-');
      expect(segments.every((segment) => /^[a-z]+$/u.test(segment))).toBe(true);
    }
  });

  it('maps every persona to its headline title key', () => {
    expect(DASHBOARD_PERSONA_TITLE_KEYS.member).toMatch(/^dashboard\./u);
    expect(DASHBOARD_PERSONA_TITLE_KEYS.coach).toMatch(/^dashboard\./u);
    expect(DASHBOARD_PERSONA_TITLE_KEYS.administrator).toMatch(/^dashboard\./u);
  });
});
