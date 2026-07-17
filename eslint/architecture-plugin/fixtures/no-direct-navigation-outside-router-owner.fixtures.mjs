export default {
  valid: [
    {
      filename: 'src/platform/lifecycle/app-reload.facade.ts',
      code: 'export function reloadApplication(){ globalThis.location.reload(); }',
    },
    {
      filename: 'src/modules/demo/hooks/use-demo-navigation.hook.ts',
      code: 'import { useAppNavigation } from "@/packages/router"; export function useDemoNavigation(){ return useAppNavigation(); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/hooks/use-demo-navigation.hook.ts',
      code: 'export function useDemoNavigation(){ return () => { globalThis.location.assign(target); }; }',
      errors: [{ messageId: 'directNavigation' }],
    },
    {
      filename: 'src/modules/demo/services/go-back.service.ts',
      code: 'export function goBack(){ globalThis.history.back(); }',
      errors: [{ messageId: 'directNavigation' }],
    },
  ],
};
