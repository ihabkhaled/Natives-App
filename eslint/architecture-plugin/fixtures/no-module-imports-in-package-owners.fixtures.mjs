export default {
  valid: [
    {
      filename: 'src/packages/http/http-client.facade.ts',
      code: 'import { schemaBuilder } from "@/packages/schema"; export function buildIt(){ return schemaBuilder.string(); }',
    },
  ],
  invalid: [
    {
      filename: 'src/packages/http/http-client.facade.ts',
      code: 'import { getAuthTokenRepository } from "@/modules/auth"; export function buildIt(){ return getAuthTokenRepository(); }',
      errors: [{ messageId: 'appCodeInPackage' }],
    },
    {
      filename: 'src/packages/state/store.factory.ts',
      code: 'import { STORAGE_KEYS } from "@/shared/config"; export function buildIt(){ return STORAGE_KEYS; }',
      errors: [{ messageId: 'appCodeInPackage' }],
    },
  ],
};
