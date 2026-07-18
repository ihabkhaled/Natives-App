import {
  PWA_SERVICE_WORKER_SCOPE,
  PWA_SERVICE_WORKER_URL,
  PWA_SKIP_WAITING_MESSAGE,
  PWA_UPDATE_APPLY_RESULT,
} from './service-worker.constants';
import type {
  ApplyPwaUpdate,
  PwaRegistrationState,
  PwaServiceWorkerLifecycle,
  PwaServiceWorkerOptions,
  PwaUpdateApplyResult,
} from './service-worker.types';

function createInactiveLifecycle(): PwaServiceWorkerLifecycle {
  return {
    checkForUpdate: () => Promise.resolve(),
    dispose: () => undefined,
  };
}

function canRegisterServiceWorker(options: PwaServiceWorkerOptions): boolean {
  return options.enabled && 'serviceWorker' in globalThis.navigator;
}

function isWaitingWorkerAvailable(worker: ServiceWorker, state: PwaRegistrationState): boolean {
  return !state.disposed && !state.applying && state.waitingWorker === worker;
}

async function applyWaitingWorker(
  worker: ServiceWorker,
  state: PwaRegistrationState,
  options: PwaServiceWorkerOptions,
): Promise<PwaUpdateApplyResult> {
  if (!isWaitingWorkerAvailable(worker, state)) {
    return PWA_UPDATE_APPLY_RESULT.Unavailable;
  }
  try {
    const preserved = await options.preserveState();
    if (!preserved) {
      options.onUpdateBlocked();
      return PWA_UPDATE_APPLY_RESULT.Blocked;
    }
    if (!isWaitingWorkerAvailable(worker, state)) {
      return PWA_UPDATE_APPLY_RESULT.Unavailable;
    }
    state.applying = true;
    worker.postMessage(PWA_SKIP_WAITING_MESSAGE);
    return PWA_UPDATE_APPLY_RESULT.Requested;
  } catch {
    options.onError();
    return PWA_UPDATE_APPLY_RESULT.Failed;
  }
}

function exposeWaitingWorker(
  worker: ServiceWorker,
  state: PwaRegistrationState,
  options: PwaServiceWorkerOptions,
): void {
  if (state.disposed || state.waitingWorker === worker) {
    return;
  }
  state.waitingWorker = worker;
  const applyUpdate: ApplyPwaUpdate = () => applyWaitingWorker(worker, state, options);
  options.onUpdateReady(applyUpdate);
}

function observeInstallingWorker(
  worker: ServiceWorker,
  state: PwaRegistrationState,
  options: PwaServiceWorkerOptions,
): () => void {
  const onStateChange = (): void => {
    if (worker.state === 'installed' && globalThis.navigator.serviceWorker.controller !== null) {
      exposeWaitingWorker(worker, state, options);
    }
  };
  worker.addEventListener('statechange', onStateChange);
  return () => {
    worker.removeEventListener('statechange', onStateChange);
  };
}

function connectRegistration(
  registration: ServiceWorkerRegistration,
  state: PwaRegistrationState,
  options: PwaServiceWorkerOptions,
): () => void {
  if (registration.waiting !== null && globalThis.navigator.serviceWorker.controller !== null) {
    exposeWaitingWorker(registration.waiting, state, options);
  }
  const onUpdateFound = (): void => {
    state.removeInstallingListener();
    const worker = registration.installing;
    state.removeInstallingListener =
      worker === null ? () => undefined : observeInstallingWorker(worker, state, options);
  };
  onUpdateFound();
  registration.addEventListener('updatefound', onUpdateFound);
  return () => {
    state.removeInstallingListener();
    registration.removeEventListener('updatefound', onUpdateFound);
  };
}

function startRegistration(
  state: PwaRegistrationState,
  options: PwaServiceWorkerOptions,
): Promise<ServiceWorkerRegistration | null> {
  return globalThis.navigator.serviceWorker
    .register(PWA_SERVICE_WORKER_URL, {
      scope: PWA_SERVICE_WORKER_SCOPE,
      updateViaCache: 'none',
    })
    .then((registration) => (state.disposed ? null : registration))
    .catch(() => {
      if (!state.disposed) {
        options.onError();
      }
      return null;
    });
}

function createRegistrationState(): PwaRegistrationState {
  return {
    disposed: false,
    applying: false,
    waitingWorker: null,
    removeInstallingListener: () => undefined,
  };
}

/**
 * Owns the browser Service Worker API. Registration is production-web only;
 * callers receive a lifecycle handle so every event listener is removed.
 */
export function registerPwaServiceWorker(
  options: PwaServiceWorkerOptions,
): PwaServiceWorkerLifecycle {
  if (!canRegisterServiceWorker(options)) {
    return createInactiveLifecycle();
  }
  const state = createRegistrationState();
  let removeRegistrationListeners = (): void => undefined;
  const registrationPromise = startRegistration(state, options).then((registration) => {
    if (registration !== null) {
      removeRegistrationListeners = connectRegistration(registration, state, options);
    }
    return registration;
  });
  const onControllerChange = (): void => {
    if (state.applying && !state.disposed) {
      state.applying = false;
      state.waitingWorker = null;
      options.onActivated();
    }
  };
  const checkForUpdate = async (): Promise<void> => {
    const registration = await registrationPromise;
    if (registration !== null && !state.disposed) {
      await registration.update().catch(options.onError);
    }
  };
  const onVisibilityChange = (): void => {
    if (globalThis.document.visibilityState === 'visible') {
      void checkForUpdate();
    }
  };
  globalThis.navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
  globalThis.document.addEventListener('visibilitychange', onVisibilityChange);
  return {
    checkForUpdate,
    dispose: () => {
      state.disposed = true;
      removeRegistrationListeners();
      globalThis.document.removeEventListener('visibilitychange', onVisibilityChange);
      globalThis.navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange,
      );
    },
  };
}

export type {
  ApplyPwaUpdate,
  PwaServiceWorkerLifecycle,
  PwaServiceWorkerOptions,
  PwaUpdateApplyResult,
} from './service-worker.types';
