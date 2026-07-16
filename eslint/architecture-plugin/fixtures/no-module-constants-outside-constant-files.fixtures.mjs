export default {
  valid: [
    {
      filename: 'src/modules/demo/constants/demo.constants.ts',
      code: 'export const DEMO_LIMIT = 25;',
    },
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'import { getLogger } from "@/platform"; const logger = getLogger("demo"); export function useDemo(){ return logger; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'const DEMO_LIMIT = 25; export function useDemo(){ return DEMO_LIMIT; }',
      errors: [{ messageId: 'inlineConstant' }],
    },
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'const RETRY_POLICY = { attempts: 3 }; export async function loadDemo(){ return RETRY_POLICY; }',
      errors: [{ messageId: 'inlineConstant' }],
    },
  ],
};
