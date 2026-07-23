import { describe, expect, it } from 'vitest';

import { VALID_BADGE_TIERS } from '@/tests/msw/setting-values.fixture';

import { SETTING_KEYS } from '../constants/admin.constants';
import { parseTypedSettingValue } from '../schemas/setting-values.schema';
import type { BadgeTiersValue, TypedSettingValue } from '../types/setting-values.types';
import { bindSettingEditor, draftFromEffective, emptySettingValue } from './setting-draft.helper';

const PARSEABLE_KEYS = SETTING_KEYS.filter((key) => key !== 'report_branding');

describe('emptySettingValue', () => {
  it.each(PARSEABLE_KEYS)('produces a schema-parseable starting document for %s', (key) => {
    expect(parseTypedSettingValue(key, emptySettingValue(key)).success).toBe(true);
  });

  it('starts branding deliberately blank: the admin must name the team first', () => {
    const empty = emptySettingValue('report_branding');
    expect(empty.displayName).toBe('');
    expect(parseTypedSettingValue('report_branding', empty).success).toBe(false);
  });
});

describe('draftFromEffective', () => {
  it('prefills from a valid effective value', () => {
    const draft = draftFromEffective(
      'badge_tiers',
      VALID_BADGE_TIERS as unknown as TypedSettingValue,
    );
    expect(draft.tiers).toHaveLength(3);
  });

  it('falls back to the empty document when nothing is effective', () => {
    expect(draftFromEffective('badge_tiers', null).tiers).toHaveLength(1);
  });

  it('falls back when the effective value belongs to another key', () => {
    const foreign = { weights: { present_on_time: 1 } } as TypedSettingValue;
    expect(draftFromEffective('badge_tiers', foreign).tiers).toHaveLength(1);
  });
});

describe('bindSettingEditor', () => {
  it('carries the key, value, and change handler through the binding', () => {
    const value = emptySettingValue('badge_tiers');
    const changes: TypedSettingValue[] = [];
    const binding = bindSettingEditor('badge_tiers', value, (next) => changes.push(next));

    expect(binding.settingKey).toBe('badge_tiers');
    expect(binding.value).toBe(value);
    (binding.onChange as (next: BadgeTiersValue) => void)({ tiers: [] });
    expect(changes).toEqual([{ tiers: [] }]);
  });
});
