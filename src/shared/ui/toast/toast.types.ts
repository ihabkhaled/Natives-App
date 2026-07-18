export type ToastTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface ToastAction {
  readonly label: string;
  readonly onSelect: () => void;
}

export interface ShowToastOptions {
  readonly message: string;
  readonly tone?: ToastTone;
  readonly durationMs?: number;
  readonly action?: ToastAction;
}
