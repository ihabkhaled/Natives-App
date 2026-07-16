export default {
  valid: [
    {
      filename: 'src/platform/network/hooks/use-net.hook.ts',
      code: 'import { useEffect } from "react"; import { subscribeToNetworkChanges } from "@/packages/capacitor-network"; export function useNet(){ useEffect(() => { const cleanup = subscribeToNetworkChanges(() => undefined); return () => { cleanup(); }; }, []); }',
    },
  ],
  invalid: [
    {
      filename: 'src/platform/network/hooks/use-net.hook.ts',
      code: 'import { useEffect } from "react"; import { subscribeToNetworkChanges } from "@/packages/capacitor-network"; export function useNet(){ useEffect(() => { const cleanup = subscribeToNetworkChanges(() => undefined); void cleanup; }, []); }',
      errors: [{ messageId: 'missingCleanup' }],
    },
  ],
};
