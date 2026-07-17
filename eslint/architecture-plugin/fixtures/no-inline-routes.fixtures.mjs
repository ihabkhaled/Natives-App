export default {
  valid: [
    {
      filename: 'src/modules/demo/routes/demo.paths.ts',
      code: 'export function demoPath(){ return "/demo"; }',
    },
    {
      filename: 'src/modules/demo/constants/demo-api.constants.ts',
      code: 'export const DEMO_API_PATHS = { list: "/demo" };',
    },
    {
      filename: 'src/modules/demo/hooks/use-demo-navigation.hook.ts',
      code: 'import { demoPath } from "../routes/demo.paths"; export function useDemoNavigation(){ return demoPath(); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/hooks/use-demo-navigation.hook.ts',
      code: 'export function useDemoNavigation(){ return "/demo"; }',
      errors: [{ messageId: 'inlinePath' }],
    },
  ],
};
