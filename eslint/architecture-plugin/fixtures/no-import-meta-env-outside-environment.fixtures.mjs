export default {
  valid: [
    {
      filename: 'src/packages/environment/environment.facade.ts',
      code: 'export function readMode(){ return import.meta.env.MODE; }',
    },
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'import { getEnvironment } from "@/packages/environment"; export function loadDemo(){ return getEnvironment().apiBaseUrl; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'export function loadDemo(){ return import.meta.env.VITE_API_BASE_URL; }',
      errors: [{ messageId: 'envAccess' }],
    },
  ],
};
