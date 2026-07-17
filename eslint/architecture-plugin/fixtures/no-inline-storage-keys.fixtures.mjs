export default {
  valid: [
    {
      filename: 'src/modules/demo/repositories/token.repository.ts',
      code: 'import { getSecureValue } from "@/packages/secure-storage"; import { STORAGE_KEYS } from "@/shared/config"; export function createRepo(){ return { read: () => getSecureValue(STORAGE_KEYS.authAccessToken) }; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/repositories/token.repository.ts',
      code: 'import { getSecureValue } from "@/packages/secure-storage"; export function createRepo(){ return { read: () => getSecureValue("raw-key") }; }',
      errors: [{ messageId: 'inlineStorageKey' }],
    },
  ],
};
