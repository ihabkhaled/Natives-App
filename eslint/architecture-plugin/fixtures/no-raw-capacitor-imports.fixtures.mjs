export default {
  valid: [
    {
      filename: 'src/packages/capacitor-network/capacitor-network.facade.ts',
      code: 'import { Network } from "@capacitor/network"; export function getIt(){ return Network.getStatus(); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/hooks/use-demo-network.hook.ts',
      code: 'import { Network } from "@capacitor/network"; export function useDemoNetwork(){ return Network; }',
      errors: [{ messageId: 'outsideOwner' }],
    },
    {
      filename: 'src/platform/network/network.facade.ts',
      code: 'import { Network } from "@capacitor/network"; export function subscribe(){ return Network.addListener("networkStatusChange", () => undefined); }',
      errors: [{ messageId: 'outsideOwner' }],
    },
  ],
};
