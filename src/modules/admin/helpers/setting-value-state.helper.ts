import type { SettingKey } from '../constants/admin.constants';
import type { SettingValueState } from '../constants/setting-values.constants';
import { parseTypedSettingValue } from '../schemas/setting-values.schema';
import type { SettingVersionValue, TypedSettingValue } from '../types/setting-values.types';

interface ClassifiableValue {
  readonly settingKey: SettingKey;
  readonly valueState: SettingValueState | null;
  readonly value: unknown;
}

/** Loud contract failure: a `valid`-marked document must parse per key. */
function contractViolation(dto: ClassifiableValue): Error {
  return new Error(`setting value contract violation for ${dto.settingKey}`);
}

/**
 * Resolve a snapshot row's effective value. A `valid` row must parse through
 * the per-key schema — a server that marks nonsense as valid fails the read
 * loudly instead of leaking an unvalidated document into settings math.
 * Legacy and not-configured rows resolve to null (D4: never served raw).
 */
export function resolveEffectiveValue(dto: ClassifiableValue): TypedSettingValue | null {
  if (dto.valueState !== 'valid') {
    return null;
  }
  const parsed = parseTypedSettingValue(dto.settingKey, dto.value);
  if (!parsed.success) {
    throw contractViolation(dto);
  }
  return parsed.data;
}

/**
 * Wrap a version row's stored document: typed when `valid`, or the honest
 * `{ state: 'legacy', raw }` wrapper the history screen renders read-only.
 */
export function wrapVersionValue(dto: ClassifiableValue): SettingVersionValue {
  if (dto.valueState === 'legacy') {
    return { state: 'legacy', raw: dto.value };
  }
  const parsed = parseTypedSettingValue(dto.settingKey, dto.value);
  if (!parsed.success) {
    throw contractViolation(dto);
  }
  return { state: 'valid', value: parsed.data };
}
