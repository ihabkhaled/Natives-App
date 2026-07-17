import type { PluginListenerHandle } from '@capacitor/core';
import { Network } from '@capacitor/network';

export interface NetworkSnapshot {
  readonly connected: boolean;
  readonly connectionType: string;
}

export async function getNetworkSnapshot(): Promise<NetworkSnapshot> {
  const status = await Network.getStatus();
  return { connected: status.connected, connectionType: status.connectionType };
}

export function subscribeToNetworkChanges(
  onChange: (snapshot: NetworkSnapshot) => void,
): () => void {
  const handlePromise: Promise<PluginListenerHandle> = Network.addListener(
    'networkStatusChange',
    (status) => {
      onChange({ connected: status.connected, connectionType: status.connectionType });
    },
  );
  return () => {
    void handlePromise.then((handle) => handle.remove());
  };
}
