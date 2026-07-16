export default {
  valid: [
    {
      filename: 'src/shared/helpers/format.helper.ts',
      code: 'export function formatIt(value){ return String(value); }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/helpers/format.helper.ts',
      code: 'import { useSession } from "@/modules/auth"; export function formatIt(){ return useSession; }',
      errors: [{ messageId: 'featureInShared' }],
    },
  ],
};
