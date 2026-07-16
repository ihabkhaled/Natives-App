/** Shared metadata factory so every rule documents itself consistently. */
export function createRuleMeta({ description, messages }) {
  return {
    type: 'problem',
    docs: {
      description,
      url: 'https://github.com/ihabkhaled/CapacitorRanger/tree/main/docs/eslint',
    },
    schema: [],
    messages,
  };
}

/** True when the file is application source (rules self-scope to src). */
export function isApplicationSource(filename) {
  const normalized = filename.replaceAll('\\', '/');
  if (!normalized.includes('/src/') && !normalized.startsWith('src/')) {
    return false;
  }
  return !normalized.includes('/src/tests/');
}

export function isTestFile(filename) {
  return filename.includes('.test.') || filename.includes('.spec.');
}
