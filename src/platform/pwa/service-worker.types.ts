export type PwaUpdateApplyResult = 'requested' | 'blocked' | 'unavailable' | 'failed';
export type ApplyPwaUpdate = () => Promise<PwaUpdateApplyResult>;

export interface PwaServiceWorkerOptions {
  readonly enabled: boolean;
  readonly preserveState: () => Promise<boolean>;
  readonly onUpdateReady: (applyUpdate: ApplyPwaUpdate) => void;
  readonly onUpdateBlocked: () => void;
  readonly onActivated: () => void;
  readonly onError: () => void;
}

export interface PwaServiceWorkerLifecycle {
  readonly checkForUpdate: () => Promise<void>;
  readonly dispose: () => void;
}

export interface PwaRegistrationState {
  disposed: boolean;
  applying: boolean;
  waitingWorker: ServiceWorker | null;
  removeInstallingListener: () => void;
}
