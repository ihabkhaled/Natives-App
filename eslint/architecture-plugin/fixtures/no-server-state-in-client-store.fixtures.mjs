export default {
  valid: [
    {
      filename: 'src/modules/demo/store/demo.store.ts',
      code: 'import { createAppStore } from "@/packages/state"; export const useDemoStore = createAppStore((set) => ({ open: false, toggle: () => { set((s) => ({ open: !s.open })); } }));',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/store/demo.store.ts',
      code: 'import { requestDemo } from "../gateways/demo.gateway"; export const useDemoStore = { load: requestDemo };',
      errors: [{ messageId: 'serverStateInStore' }],
    },
  ],
};
