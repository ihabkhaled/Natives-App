export default {
  valid: [
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'import { getEnvironment } from "@/packages/environment"; export function loadDemo(){ return getEnvironment().mode; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'export function loadDemo(){ return process.env.NODE_ENV; }',
      errors: [{ messageId: 'processEnv' }],
    },
  ],
};
