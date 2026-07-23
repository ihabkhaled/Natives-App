import { I18N_KEYS } from '@/shared/i18n';
import type { SelectFieldOption } from '@/shared/ui';

import type {
  SettingEditorContext,
  SettingEditorLabels,
} from '../components/setting-editors/setting-editors.types';
import { SETTING_KEY_LABEL_KEYS } from '../constants/admin-labels.constants';
import type { SettingKey } from '../constants/admin.constants';
import {
  COLOR_TOKEN_LABEL_KEYS,
  NOTIFICATION_EVENT_LABEL_KEYS,
  RECIPIENT_LABEL_KEYS,
  STATUS_CODE_LABEL_KEYS,
} from '../constants/setting-editor-labels.constants';
import type { CatalogEntry } from '../types/admin.types';

type Translate = (key: string) => string;

function toOptions(t: Translate, keys: Readonly<Record<string, string>>): SelectFieldOption[] {
  return Object.entries(keys).map(([value, labelKey]) => ({ value, label: t(labelKey) }));
}

function buildColorOptions(t: Translate): readonly SelectFieldOption[] {
  return toOptions(t, COLOR_TOKEN_LABEL_KEYS);
}

function buildStatusCodeOptions(t: Translate): readonly SelectFieldOption[] {
  return toOptions(t, STATUS_CODE_LABEL_KEYS);
}

function buildRecipientOptions(t: Translate): readonly SelectFieldOption[] {
  return toOptions(t, RECIPIENT_LABEL_KEYS);
}

function buildEventNames(t: Translate): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(NOTIFICATION_EVENT_LABEL_KEYS).map(([event, key]) => [event, t(key)]),
  );
}

function buildSettingKeyLabels(t: Translate): Readonly<Record<SettingKey, string>> {
  return Object.fromEntries(
    Object.entries(SETTING_KEY_LABEL_KEYS).map(([key, labelKey]) => [key, t(labelKey)]),
  ) as Record<SettingKey, string>;
}

/**
 * Everything the editors need beyond the live draft: labels, closed option
 * lists, and the active position catalog for roster caps.
 */
export function buildEditorContextBase(
  t: Translate,
  positions: readonly CatalogEntry[],
): Omit<SettingEditorContext, 'weights' | 'scalePreview'> {
  return {
    labels: buildSettingEditorLabels(t),
    keyLabels: buildSettingKeyLabels(t),
    colorOptions: buildColorOptions(t),
    statusOptions: buildStatusCodeOptions(t),
    recipientOptions: buildRecipientOptions(t),
    eventNames: buildEventNames(t),
    positionOptions: positions
      .filter((entry) => entry.status === 'active')
      .map((entry) => ({ value: entry.key, label: entry.label })),
  };
}

function collectionEditorLabels(t: Translate) {
  const keys = I18N_KEYS.settingEditors;
  return {
    moveUp: t(keys.moveUp),
    moveDown: t(keys.moveDown),
    remove: t(keys.remove),
    code: t(keys.code),
    labelEn: t(keys.labelEn),
    labelAr: t(keys.labelAr),
    color: t(keys.color),
    active: t(keys.active),
    statusesAdd: t(keys.statusesAdd),
    countsTowardMetrics: t(keys.countsTowardMetrics),
    allowSelfCheckIn: t(keys.allowSelfCheckIn),
    typesAdd: t(keys.typesAdd),
    duration: t(keys.duration),
    scaleMin: t(keys.scaleMin),
    scaleMax: t(keys.scaleMax),
    scaleStep: t(keys.scaleStep),
    bandsHeading: t(keys.bandsHeading),
    bandsAdd: t(keys.bandsAdd),
    bandKey: t(keys.bandKey),
    bandFrom: t(keys.bandFrom),
    bandTo: t(keys.bandTo),
    tiersAdd: t(keys.tiersAdd),
    tierKey: t(keys.tierKey),
    threshold: t(keys.threshold),
  };
}

function formEditorLabels(t: Translate) {
  const keys = I18N_KEYS.settingEditors;
  return {
    weightLabel: t(keys.weightLabel),
    rosterHeading: t(keys.rosterHeading),
    squadHeading: t(keys.squadHeading),
    rosterMin: t(keys.rosterMin),
    rosterMax: t(keys.rosterMax),
    squadMin: t(keys.squadMin),
    squadMax: t(keys.squadMax),
    squadFloorHint: t(keys.squadFloorHint),
    positionsHeading: t(keys.positionsHeading),
    positionsAdd: t(keys.positionsAdd),
    position: t(keys.position),
    positionMax: t(keys.positionMax),
    enabled: t(keys.enabled),
    channelPush: t(keys.channelPush),
    channelEmail: t(keys.channelEmail),
    recipients: t(keys.recipients),
    leadHours: t(keys.leadHours),
    quietHoursHeading: t(keys.quietHoursHeading),
    quietHoursUse: t(keys.quietHoursUse),
    quietStart: t(keys.quietStart),
    quietEnd: t(keys.quietEnd),
    quietOvernight: t(keys.quietOvernight),
    displayName: t(keys.displayName),
    accentColor: t(keys.accentColor),
    footerText: t(keys.footerText),
    contactEmail: t(keys.contactEmail),
    logoKey: t(keys.logoKey),
    previewHeading: t(keys.previewHeading),
  };
}

/** Every translated editor label, resolved once per settings screen render. */
function buildSettingEditorLabels(t: Translate): SettingEditorLabels {
  return { ...collectionEditorLabels(t), ...formEditorLabels(t) };
}
