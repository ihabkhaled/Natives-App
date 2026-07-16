interface RandomUuidSource {
  readonly randomUUID?: (() => string) | undefined;
}

export function createCorrelationId(source: RandomUuidSource = globalThis.crypto): string {
  if (typeof source.randomUUID === 'function') {
    return source.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 12);
  return `req-${timestamp}-${random}`;
}
