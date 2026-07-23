import { useState } from 'react';

import { CATALOG_KINDS, SETTING_KEYS, type SettingKey } from '../constants/admin.constants';

export interface SettingsSelectionView {
  readonly settingKey: SettingKey;
  readonly catalog: string;
  readonly setSettingKey: (value: string) => void;
  readonly setCatalog: (value: string) => void;
}

/** Which setting key's history and which reference catalog are on screen. */
export function useSettingsSelection(): SettingsSelectionView {
  const [settingKey, setSettingKey] = useState<SettingKey>(SETTING_KEYS[0]);
  const [catalog, setCatalog] = useState<string>(CATALOG_KINDS[0]);
  return {
    settingKey,
    catalog,
    setSettingKey: (value) => {
      setSettingKey(SETTING_KEYS.find((candidate) => candidate === value) ?? SETTING_KEYS[0]);
    },
    setCatalog,
  };
}
