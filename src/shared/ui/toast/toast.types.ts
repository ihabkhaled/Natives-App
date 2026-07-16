export type ToastTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface ShowToastOptions {
  readonly message: string;
  readonly tone?: ToastTone;
  readonly durationMs?: number;
}
