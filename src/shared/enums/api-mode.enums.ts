export const API_MODE = {
  Mock: 'mock',
  Remote: 'remote',
} as const;

export type ApiMode = (typeof API_MODE)[keyof typeof API_MODE];
