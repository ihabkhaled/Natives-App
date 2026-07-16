import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';

import { createConsoleSink, createLogger } from '@/packages/logger';

const logger = createLogger('secure-storage', createConsoleSink());

/**
 * Browser-development fallback. Tokens live in memory (primary) with a
 * sessionStorage mirror so a dev-server reload keeps the session. This is
 * NOT secure at rest and exists only for web development; native builds
 * always use hardware-backed secure storage. See docs/security/token-storage.md.
 */
const webFallbackMemory = new Map<string, string>();
let webFallbackWarned = false;

function warnWebFallbackOnce(): void {
  if (!webFallbackWarned) {
    webFallbackWarned = true;
    logger.warn('Using the browser-development secure-storage fallback; not secure at rest.');
  }
}

function readSessionMirror(key: string): string | null {
  try {
    return globalThis.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionMirror(key: string, value: string | null): void {
  try {
    if (value === null) {
      globalThis.sessionStorage.removeItem(key);
      return;
    }
    globalThis.sessionStorage.setItem(key, value);
  } catch {
    // Session storage can be unavailable (private mode); memory still works.
  }
}

export async function getSecureValue(key: string): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    const value = await SecureStorage.get(key);
    return typeof value === 'string' ? value : null;
  }
  warnWebFallbackOnce();
  return webFallbackMemory.get(key) ?? readSessionMirror(key);
}

export async function setSecureValue(key: string, value: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await SecureStorage.set(key, value);
    return;
  }
  warnWebFallbackOnce();
  webFallbackMemory.set(key, value);
  writeSessionMirror(key, value);
}

export async function removeSecureValue(key: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await SecureStorage.remove(key);
    return;
  }
  webFallbackMemory.delete(key);
  writeSessionMirror(key, null);
}
