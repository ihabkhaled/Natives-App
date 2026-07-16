export default {
  valid: [
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'import { useNetworkStatus } from "@/platform"; export function useDemo(){ return useNetworkStatus(); }',
    },
    {
      filename: 'src/shared/helpers/json.helper.ts',
      code: 'import { safeParseWithSchema } from "@/packages/schema"; export function parseIt(schema, v){ return safeParseWithSchema(schema, v); }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/helpers/json.helper.ts',
      code: 'import { useNetworkStatus } from "@/platform"; export function parseIt(){ return useNetworkStatus; }',
      errors: [{ messageId: 'restrictedLayer' }],
    },
    {
      filename: 'src/packages/schema/schema.helper.ts',
      code: 'import { STORAGE_KEYS } from "@/shared/config"; export function readIt(){ return STORAGE_KEYS; }',
      errors: [{ messageId: 'restrictedLayer' }],
    },
  ],
};
