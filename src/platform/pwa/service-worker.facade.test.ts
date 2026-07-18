import { afterEach, describe, expect, it, vi } from 'vitest';

import { PWA_SKIP_WAITING_MESSAGE } from './service-worker.constants';
import {
  registerPwaServiceWorker,
  type ApplyPwaUpdate,
  type PwaServiceWorkerOptions,
} from './service-worker.facade';

interface WorkerFixture {
  readonly worker: ServiceWorker;
  readonly postMessage: ReturnType<typeof vi.fn>;
  readonly setState: (state: ServiceWorkerState) => void;
}

interface RegistrationFixture {
  readonly registration: ServiceWorkerRegistration;
  readonly update: ReturnType<typeof vi.fn>;
  readonly setInstalling: (worker: ServiceWorker | null) => void;
  readonly setWaiting: (worker: ServiceWorker | null) => void;
}

interface ContainerFixture {
  readonly container: ServiceWorkerContainer;
  readonly register: ReturnType<typeof vi.fn>;
  readonly setController: (worker: ServiceWorker | null) => void;
}

function createWorker(initialState: ServiceWorkerState = 'installed'): WorkerFixture {
  const target = new EventTarget();
  let state = initialState;
  const postMessage = vi.fn();
  Object.defineProperties(target, {
    state: { configurable: true, get: () => state },
    postMessage: { configurable: true, value: postMessage },
  });
  return {
    worker: target as ServiceWorker,
    postMessage,
    setState: (nextState) => {
      state = nextState;
    },
  };
}

function createRegistration(): RegistrationFixture {
  const target = new EventTarget();
  let installing: ServiceWorker | null = null;
  let waiting: ServiceWorker | null = null;
  const update = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  Object.defineProperties(target, {
    installing: { configurable: true, get: () => installing },
    waiting: { configurable: true, get: () => waiting },
    update: { configurable: true, value: update },
  });
  return {
    registration: target as ServiceWorkerRegistration,
    update,
    setInstalling: (worker) => {
      installing = worker;
    },
    setWaiting: (worker) => {
      waiting = worker;
    },
  };
}

function createContainer(
  registration: ServiceWorkerRegistration,
  initialController: ServiceWorker | null = createWorker().worker,
): ContainerFixture {
  const target = new EventTarget();
  let controller = initialController;
  const register = vi
    .fn<() => Promise<ServiceWorkerRegistration>>()
    .mockResolvedValue(registration);
  Object.defineProperties(target, {
    controller: { configurable: true, get: () => controller },
    register: { configurable: true, value: register },
  });
  return {
    container: target as ServiceWorkerContainer,
    register,
    setController: (worker) => {
      controller = worker;
    },
  };
}

function buildOptions(overrides: Partial<PwaServiceWorkerOptions> = {}): PwaServiceWorkerOptions {
  return {
    enabled: true,
    preserveState: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
    onUpdateReady: vi.fn(),
    onUpdateBlocked: vi.fn(),
    onActivated: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

function installContainer(container: ServiceWorkerContainer): void {
  vi.stubGlobal('navigator', { serviceWorker: container });
}

async function settleRegistration(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function exposedApply(options: PwaServiceWorkerOptions): ApplyPwaUpdate {
  return vi.mocked(options.onUpdateReady).mock.calls[0]![0];
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('registerPwaServiceWorker', () => {
  it('stays inactive when production registration is disabled', async () => {
    const options = buildOptions({ enabled: false });

    const lifecycle = registerPwaServiceWorker(options);

    await expect(lifecycle.checkForUpdate()).resolves.toBeUndefined();
    expect(() => {
      lifecycle.dispose();
    }).not.toThrow();
  });

  it('stays inactive when the browser has no service-worker support', async () => {
    vi.stubGlobal('navigator', {});
    const lifecycle = registerPwaServiceWorker(buildOptions());

    await expect(lifecycle.checkForUpdate()).resolves.toBeUndefined();
  });

  it('registers the root worker without using the HTTP cache for update checks', async () => {
    const registration = createRegistration();
    const container = createContainer(registration.registration);
    installContainer(container.container);

    const lifecycle = registerPwaServiceWorker(buildOptions());
    await lifecycle.checkForUpdate();

    expect(container.register).toHaveBeenCalledExactlyOnceWith('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    expect(registration.update).toHaveBeenCalledOnce();
  });

  it('exposes an already waiting update and applies it only after preservation', async () => {
    const waiting = createWorker();
    const registration = createRegistration();
    registration.setWaiting(waiting.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const preserveState = vi.fn<() => Promise<boolean>>().mockResolvedValue(true);
    const options = buildOptions({ preserveState });

    registerPwaServiceWorker(options);
    await settleRegistration();

    await expect(exposedApply(options)()).resolves.toBe('requested');
    expect(preserveState).toHaveBeenCalledOnce();
    expect(waiting.postMessage).toHaveBeenCalledExactlyOnceWith(PWA_SKIP_WAITING_MESSAGE);
  });

  it('leaves the waiting worker untouched when state cannot be preserved', async () => {
    const waiting = createWorker();
    const registration = createRegistration();
    registration.setWaiting(waiting.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const options = buildOptions({
      preserveState: vi.fn<() => Promise<boolean>>().mockResolvedValue(false),
    });

    registerPwaServiceWorker(options);
    await settleRegistration();

    await expect(exposedApply(options)()).resolves.toBe('blocked');
    expect(options.onUpdateBlocked).toHaveBeenCalledOnce();
    expect(waiting.postMessage).not.toHaveBeenCalled();
  });

  it('fails closed when preservation throws', async () => {
    const waiting = createWorker();
    const registration = createRegistration();
    registration.setWaiting(waiting.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const options = buildOptions({
      preserveState: vi
        .fn<() => Promise<boolean>>()
        .mockRejectedValue(new Error('synthetic preservation failure')),
    });

    registerPwaServiceWorker(options);
    await settleRegistration();

    await expect(exposedApply(options)()).resolves.toBe('failed');
    expect(options.onError).toHaveBeenCalledOnce();
    expect(waiting.postMessage).not.toHaveBeenCalled();
  });

  it('does not activate when disposal happens while preservation is in progress', async () => {
    const waiting = createWorker();
    const registration = createRegistration();
    registration.setWaiting(waiting.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    let finishPreservation: ((preserved: boolean) => void) | undefined;
    const preserveState = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finishPreservation = resolve;
        }),
    );
    const options = buildOptions({ preserveState });
    const lifecycle = registerPwaServiceWorker(options);
    await settleRegistration();

    const result = exposedApply(options)();
    lifecycle.dispose();
    finishPreservation?.(true);

    await expect(result).resolves.toBe('unavailable');
    expect(waiting.postMessage).not.toHaveBeenCalled();
  });

  it('invalidates an older update action when a newer worker is waiting', async () => {
    const first = createWorker();
    const second = createWorker('installing');
    const registration = createRegistration();
    registration.setWaiting(first.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const options = buildOptions();

    registerPwaServiceWorker(options);
    await settleRegistration();
    const firstApply = exposedApply(options);
    registration.setInstalling(second.worker);
    registration.registration.dispatchEvent(new Event('updatefound'));
    second.setState('installed');
    second.worker.dispatchEvent(new Event('statechange'));

    await expect(firstApply()).resolves.toBe('unavailable');
  });

  it('reloads only after the requested worker controls the page', async () => {
    const waiting = createWorker();
    const registration = createRegistration();
    registration.setWaiting(waiting.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const options = buildOptions();

    registerPwaServiceWorker(options);
    await settleRegistration();
    container.container.dispatchEvent(new Event('controllerchange'));
    expect(options.onActivated).not.toHaveBeenCalled();

    await exposedApply(options)();
    container.container.dispatchEvent(new Event('controllerchange'));
    container.container.dispatchEvent(new Event('controllerchange'));

    expect(options.onActivated).toHaveBeenCalledOnce();
  });

  it('allows a waiting worker to be applied only once', async () => {
    const waiting = createWorker();
    const registration = createRegistration();
    registration.setWaiting(waiting.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const options = buildOptions();

    registerPwaServiceWorker(options);
    await settleRegistration();
    const applyUpdate = exposedApply(options);

    await expect(applyUpdate()).resolves.toBe('requested');
    await expect(applyUpdate()).resolves.toBe('unavailable');
    container.container.dispatchEvent(new Event('controllerchange'));
    await expect(applyUpdate()).resolves.toBe('unavailable');

    expect(waiting.postMessage).toHaveBeenCalledOnce();
  });

  it('observes an installing worker already present when registration resolves', async () => {
    const installing = createWorker('installing');
    const registration = createRegistration();
    registration.setInstalling(installing.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const options = buildOptions();

    registerPwaServiceWorker(options);
    await settleRegistration();
    installing.setState('installed');
    installing.worker.dispatchEvent(new Event('statechange'));

    expect(options.onUpdateReady).toHaveBeenCalledOnce();
  });

  it('detects a newly installed worker when an older worker controls the page', async () => {
    const installing = createWorker('installing');
    const registration = createRegistration();
    registration.setInstalling(installing.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const options = buildOptions();

    registerPwaServiceWorker(options);
    await settleRegistration();
    registration.registration.dispatchEvent(new Event('updatefound'));
    installing.setState('installed');
    installing.worker.dispatchEvent(new Event('statechange'));
    installing.worker.dispatchEvent(new Event('statechange'));

    expect(options.onUpdateReady).toHaveBeenCalledOnce();
  });

  it('does not present the first install as an update', async () => {
    const installing = createWorker('installing');
    const registration = createRegistration();
    registration.setInstalling(installing.worker);
    const container = createContainer(registration.registration, null);
    installContainer(container.container);
    const options = buildOptions();

    registerPwaServiceWorker(options);
    await settleRegistration();
    registration.registration.dispatchEvent(new Event('updatefound'));
    installing.setState('installed');
    installing.worker.dispatchEvent(new Event('statechange'));

    expect(options.onUpdateReady).not.toHaveBeenCalled();
  });

  it('cleans up both null and active installing-worker observers', async () => {
    const installing = createWorker('installing');
    const removeListener = vi.spyOn(installing.worker, 'removeEventListener');
    const registration = createRegistration();
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const lifecycle = registerPwaServiceWorker(buildOptions());
    await settleRegistration();

    registration.registration.dispatchEvent(new Event('updatefound'));
    registration.setInstalling(installing.worker);
    registration.registration.dispatchEvent(new Event('updatefound'));
    lifecycle.dispose();

    expect(removeListener).toHaveBeenCalledWith('statechange', expect.any(Function));
  });

  it('checks for updates whenever the PWA becomes visible', async () => {
    const registration = createRegistration();
    const container = createContainer(registration.registration);
    installContainer(container.container);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    registerPwaServiceWorker(buildOptions());
    await settleRegistration();
    document.dispatchEvent(new Event('visibilitychange'));
    await settleRegistration();

    expect(registration.update).toHaveBeenCalledOnce();
  });

  it('ignores hidden visibility changes', async () => {
    const registration = createRegistration();
    const container = createContainer(registration.registration);
    installContainer(container.container);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');

    registerPwaServiceWorker(buildOptions());
    await settleRegistration();
    document.dispatchEvent(new Event('visibilitychange'));
    await settleRegistration();

    expect(registration.update).not.toHaveBeenCalled();
  });

  it('reports registration and update failures without exposing raw errors', async () => {
    const registration = createRegistration();
    registration.update.mockRejectedValueOnce(new Error('synthetic update failure'));
    const container = createContainer(registration.registration);
    installContainer(container.container);
    const updateOptions = buildOptions();
    const updateLifecycle = registerPwaServiceWorker(updateOptions);

    await updateLifecycle.checkForUpdate();
    expect(updateOptions.onError).toHaveBeenCalledOnce();

    container.register.mockRejectedValueOnce(new Error('synthetic registration failure'));
    const registrationOptions = buildOptions();
    const registrationLifecycle = registerPwaServiceWorker(registrationOptions);
    await registrationLifecycle.checkForUpdate();
    expect(registrationOptions.onError).toHaveBeenCalledOnce();
  });

  it('ignores a registration that resolves after disposal', async () => {
    const registration = createRegistration();
    let finishRegistration: ((value: ServiceWorkerRegistration) => void) | undefined;
    const pendingRegistration = new Promise<ServiceWorkerRegistration>((resolve) => {
      finishRegistration = resolve;
    });
    const container = createContainer(registration.registration);
    container.register.mockReturnValueOnce(pendingRegistration);
    installContainer(container.container);
    const options = buildOptions();
    const lifecycle = registerPwaServiceWorker(options);

    lifecycle.dispose();
    finishRegistration?.(registration.registration);
    await lifecycle.checkForUpdate();

    expect(registration.update).not.toHaveBeenCalled();
    expect(options.onError).not.toHaveBeenCalled();
  });

  it('does not report a registration failure after disposal', async () => {
    const registration = createRegistration();
    let failRegistration: ((reason?: unknown) => void) | undefined;
    const pendingRegistration = new Promise<ServiceWorkerRegistration>((_resolve, reject) => {
      failRegistration = reject;
    });
    const container = createContainer(registration.registration);
    container.register.mockReturnValueOnce(pendingRegistration);
    installContainer(container.container);
    const options = buildOptions();
    const lifecycle = registerPwaServiceWorker(options);

    lifecycle.dispose();
    failRegistration?.(new Error('synthetic late failure'));
    await lifecycle.checkForUpdate();

    expect(options.onError).not.toHaveBeenCalled();
  });

  it('removes listeners and invalidates an exposed action on dispose', async () => {
    const waiting = createWorker();
    const registration = createRegistration();
    registration.setWaiting(waiting.worker);
    const container = createContainer(registration.registration);
    installContainer(container.container);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    const options = buildOptions();
    const lifecycle = registerPwaServiceWorker(options);
    await settleRegistration();
    const applyUpdate = exposedApply(options);

    lifecycle.dispose();
    document.dispatchEvent(new Event('visibilitychange'));
    container.container.dispatchEvent(new Event('controllerchange'));
    registration.registration.dispatchEvent(new Event('updatefound'));

    await expect(applyUpdate()).resolves.toBe('unavailable');
    expect(registration.update).not.toHaveBeenCalled();
    expect(options.onActivated).not.toHaveBeenCalled();
  });
});
