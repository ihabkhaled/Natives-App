export interface RealtimeClientOptions {
  readonly url: string;
  readonly getAccessToken?: () => Promise<string | null>;
}

export interface RealtimeClient {
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly isConnected: () => boolean;
  readonly on: (event: string, listener: (payload: unknown) => void) => () => void;
  readonly emit: (event: string, payload: unknown) => void;
}
