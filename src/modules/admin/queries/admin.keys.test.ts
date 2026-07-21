import { describe, expect, it } from 'vitest';

import { adminQueryKeys } from './admin.keys';

describe('adminQueryKeys', () => {
  it('roots every key under one namespace', () => {
    expect(adminQueryKeys.all).toEqual(['admin']);
  });

  it('scopes team-bound branches by team id', () => {
    expect(adminQueryKeys.settingsSnapshot('t1')).toEqual(['admin', 'team', 't1', 'settings']);
    expect(adminQueryKeys.settingsSnapshot('t2')).not.toEqual(
      adminQueryKeys.settingsSnapshot('t1'),
    );
  });

  it('keys setting versions by the selected key', () => {
    expect(adminQueryKeys.settingVersions('t1', 'roster_limits')).toEqual([
      'admin',
      'team',
      't1',
      'settings',
      'versions',
      'roster_limits',
    ]);
  });

  it('keys reference data and both rule families on their own branches', () => {
    expect(adminQueryKeys.seasons('t1')).toEqual(['admin', 'team', 't1', 'seasons']);
    expect(adminQueryKeys.venues('t1')).toEqual(['admin', 'team', 't1', 'venues']);
    expect(adminQueryKeys.catalog('t1', 'division')).toEqual([
      'admin',
      'team',
      't1',
      'catalog',
      'division',
    ]);
    expect(adminQueryKeys.rules('t1', 'points')).not.toEqual(
      adminQueryKeys.rules('t1', 'calculation'),
    );
  });

  it('keeps the global operations branch outside any team scope', () => {
    expect(adminQueryKeys.operations()).toEqual(['admin', 'operations']);
    expect(adminQueryKeys.outboxMetrics()).toEqual(['admin', 'operations', 'outbox-metrics']);
    expect(adminQueryKeys.deadLetters()).toEqual(['admin', 'operations', 'dead-letters']);
    expect(adminQueryKeys.jobHealth()).toEqual(['admin', 'operations', 'job-health']);
  });

  it('scopes the audit branch to its team', () => {
    expect(adminQueryKeys.audit('t1')).toEqual(['admin', 'team', 't1', 'audit']);
  });
});
