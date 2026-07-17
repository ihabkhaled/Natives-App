export default {
  valid: [
    {
      filename: 'src/app/router/route-registry.ts',
      code: 'import { getAuthRouteDefinitions } from "@/modules/auth"; export function routes(){ return getAuthRouteDefinitions(); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'import { AppShell } from "@/app"; export function useDemo(){ return AppShell; }',
      errors: [{ messageId: 'appImportBelowApp' }],
    },
  ],
};
