import { Preferences } from '@capacitor/preferences';

/**
 * Non-sensitive preference persistence. Tokens and secrets are forbidden
 * here; they belong to the secure-storage owner (rules/18-security.md).
 */
export async function getPreferenceValue(key: string): Promise<string | null> {
  const result = await Preferences.get({ key });
  return result.value;
}

export async function setPreferenceValue(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

export async function removePreferenceValue(key: string): Promise<void> {
  await Preferences.remove({ key });
}
