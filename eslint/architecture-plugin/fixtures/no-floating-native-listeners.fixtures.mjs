export default {
  valid: [
    {
      filename: 'src/app/lifecycle/use-app-lifecycle.hook.ts',
      code: 'import { registerHardwareBackHandler } from "@/platform"; export function useAppLifecycle(){ const cleanup = registerHardwareBackHandler({}); return cleanup; }',
    },
  ],
  invalid: [
    {
      filename: 'src/app/lifecycle/use-app-lifecycle.hook.ts',
      code: 'import { registerHardwareBackHandler } from "@/platform"; export function useAppLifecycle(){ registerHardwareBackHandler({}); }',
      errors: [{ messageId: 'floatingListener' }],
    },
  ],
};
