import type { SettingKey } from '../constants/admin.constants';
import type { SettingValueByKey, TypedSettingValue } from '../types/setting-values.types';

export type SettingDiffKind = 'added' | 'removed' | 'changed' | 'reordered';

/** One field-level difference between two versions of a setting. */
export interface SettingDiffEntry {
  readonly kind: SettingDiffKind;
  /** Stable subject: a code/key/event or a scalar path — never an index. */
  readonly label: string;
  readonly before: string | null;
  readonly after: string | null;
}

interface CollectionFacts {
  readonly order: readonly string[];
  readonly entries: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

interface SettingFacts {
  readonly scalars: Readonly<Record<string, string>>;
  /** The key's one identity-keyed list; empty for scalar-only keys. */
  readonly collection: CollectionFacts;
}

/** Scalar-only keys diff an empty collection (a no-op by construction). */
const NO_COLLECTION: CollectionFacts = { order: [], entries: {} };

function show(value: string | number | boolean | undefined): string {
  return value === undefined ? '' : String(value);
}

type FactPair = readonly [string, Readonly<Record<string, string>>];

function listFacts(pairs: readonly FactPair[]): CollectionFacts {
  return { order: pairs.map(([id]) => id), entries: Object.fromEntries(pairs) };
}

// The history list only pairs a key with its own parsed value, so the narrow
// per-branch reads below are sound by construction.
function narrow<K extends SettingKey>(_key: K, value: TypedSettingValue): SettingValueByKey[K] {
  return value as SettingValueByKey[K];
}

type FactBuilder = (value: TypedSettingValue) => SettingFacts;

const FACT_BUILDERS: Record<SettingKey, FactBuilder> = {
  attendance_statuses: (value) => {
    const statuses = narrow('attendance_statuses', value).statuses;
    return {
      scalars: {},
      collection: listFacts(
        statuses.map(
          (entry) =>
            [
              entry.code,
              {
                labelEn: entry.labelEn,
                labelAr: entry.labelAr,
                color: entry.color,
                countsTowardMetrics: show(entry.countsTowardMetrics),
                allowSelfCheckIn: show(entry.allowSelfCheckIn),
                active: show(entry.active),
              },
            ] as const,
        ),
      ),
    };
  },
  session_types: (value) => {
    const types = narrow('session_types', value).types;
    return {
      scalars: {},
      collection: listFacts(
        types.map(
          (entry) =>
            [
              entry.code,
              {
                labelEn: entry.labelEn,
                labelAr: entry.labelAr,
                color: entry.color,
                defaultDurationMinutes: show(entry.defaultDurationMinutes),
                active: show(entry.active),
              },
            ] as const,
        ),
      ),
    };
  },
  attendance_weights: (value) => {
    const weights = narrow('attendance_weights', value).weights;
    return {
      scalars: Object.fromEntries(
        Object.entries(weights).map(([code, weight]) => [code, show(weight)]),
      ),
      collection: NO_COLLECTION,
    };
  },
  assessment_scale: (value) => {
    const scale = narrow('assessment_scale', value);
    const bands = scale.bands ?? [];
    return {
      scalars: { min: show(scale.min), max: show(scale.max), step: show(scale.step) },
      collection: listFacts(
        bands.map(
          (band) =>
            [
              band.key,
              {
                labelEn: band.labelEn,
                labelAr: band.labelAr,
                from: show(band.from),
                to: show(band.to),
              },
            ] as const,
        ),
      ),
    };
  },
  badge_tiers: (value) => {
    const tiers = narrow('badge_tiers', value).tiers;
    return {
      scalars: {},
      collection: listFacts(
        tiers.map(
          (tier) =>
            [
              tier.key,
              {
                labelEn: tier.labelEn,
                labelAr: tier.labelAr,
                threshold: show(tier.threshold),
                color: tier.color,
              },
            ] as const,
        ),
      ),
    };
  },
  roster_limits: (value) => {
    const limits = narrow('roster_limits', value);
    return {
      scalars: {
        'roster.min': show(limits.roster.min),
        'roster.max': show(limits.roster.max),
        'matchSquad.min': show(limits.matchSquad?.min),
        'matchSquad.max': show(limits.matchSquad?.max),
      },
      collection: listFacts(
        (limits.perPosition ?? []).map(
          (entry) => [entry.positionKey, { max: show(entry.max) }] as const,
        ),
      ),
    };
  },
  notification_rules: (value) => {
    const rules = narrow('notification_rules', value);
    return {
      scalars: {
        'quietHours.start': show(rules.quietHours?.start),
        'quietHours.end': show(rules.quietHours?.end),
      },
      collection: listFacts(
        rules.rules.map(
          (rule) =>
            [
              rule.event,
              {
                enabled: show(rule.enabled),
                channels: rule.channels.join('+'),
                leadHours: show(rule.leadHours),
                recipients: rule.recipients,
              },
            ] as const,
        ),
      ),
    };
  },
  report_branding: (value) => {
    const branding = narrow('report_branding', value);
    return {
      scalars: {
        displayName: branding.displayName,
        logoMediaKey: show(branding.logoMediaKey),
        accentColor: show(branding.accentColor),
        footerText: show(branding.footerText),
        contactEmail: show(branding.contactEmail),
      },
      collection: NO_COLLECTION,
    };
  },
};

function diffScalars(
  previous: Readonly<Record<string, string>>,
  next: Readonly<Record<string, string>>,
): SettingDiffEntry[] {
  const keys = [...new Set([...Object.keys(previous), ...Object.keys(next)])];
  return keys.flatMap((key): SettingDiffEntry[] => {
    const before = previous[key] ?? '';
    const after = next[key] ?? '';
    if (before === after) {
      return [];
    }
    if (before === '') {
      return [{ kind: 'added', label: key, before: null, after }];
    }
    if (after === '') {
      return [{ kind: 'removed', label: key, before, after: null }];
    }
    return [{ kind: 'changed', label: key, before, after }];
  });
}

function diffEntryFields(
  id: string,
  previous: Readonly<Record<string, string>>,
  next: Readonly<Record<string, string>>,
): SettingDiffEntry[] {
  return diffScalars(previous, next).map((entry) => ({
    ...entry,
    label: `${id} · ${entry.label}`,
  }));
}

function diffCollection(previous: CollectionFacts, next: CollectionFacts): SettingDiffEntry[] {
  const entries: SettingDiffEntry[] = [];
  for (const id of previous.order) {
    if (!(id in next.entries)) {
      entries.push({ kind: 'removed', label: id, before: id, after: null });
    }
  }
  for (const [id, fields] of Object.entries(next.entries)) {
    const before = previous.entries[id];
    if (before === undefined) {
      entries.push({ kind: 'added', label: id, before: null, after: id });
    } else {
      entries.push(...diffEntryFields(id, before, fields));
    }
  }
  const sharedBefore = previous.order.filter((id) => id in next.entries);
  const sharedAfter = next.order.filter((id) => id in previous.entries);
  if (sharedBefore.join('>') !== sharedAfter.join('>')) {
    entries.push({
      kind: 'reordered',
      label: sharedAfter.join(' → '),
      before: sharedBefore.join(' → '),
      after: sharedAfter.join(' → '),
    });
  }
  return entries;
}

/**
 * Field-level differences between two typed documents of one key, compared
 * by stable identity (status code, tier key, event, position key) — never by
 * array position, so a pure reorder reads as `reordered`, not remove+add.
 * An empty result means "no effective change".
 */
export function diffSettingValues(
  key: SettingKey,
  previous: TypedSettingValue,
  next: TypedSettingValue,
): readonly SettingDiffEntry[] {
  const factsBefore = FACT_BUILDERS[key](previous);
  const factsAfter = FACT_BUILDERS[key](next);
  const entries = diffScalars(factsBefore.scalars, factsAfter.scalars);
  entries.push(...diffCollection(factsBefore.collection, factsAfter.collection));
  return entries;
}
