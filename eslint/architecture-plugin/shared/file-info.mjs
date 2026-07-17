import {
  COMPONENT_FAMILY_KINDS,
  EXACT_FILE_KINDS,
  FILE_SUFFIX_KINDS,
} from '../../filenames.config.mjs';

export function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

export function getBasename(filename) {
  const normalized = normalizePath(filename);
  return normalized.slice(normalized.lastIndexOf('/') + 1);
}

/** Classify a file by its suffix taxonomy. */
export function getFileKind(filename) {
  const base = getBasename(filename);
  if (base.includes('.test.') || base.includes('.spec.')) {
    return 'test';
  }
  const exact = EXACT_FILE_KINDS[base];
  if (exact !== undefined) {
    return exact;
  }
  const match = /\.([a-z-]+)\.(?:ts|tsx|mts|mjs)$/u.exec(base);
  if (match !== null) {
    const kind = FILE_SUFFIX_KINDS[`${match[1]}.${base.slice(base.lastIndexOf('.') + 1)}`];
    if (kind !== undefined) {
      return kind;
    }
  }
  return 'unknown';
}

export function isComponentFamily(kind) {
  return COMPONENT_FAMILY_KINDS.includes(kind);
}

const SRC_MARKER = '/src/';

/** Path of the file relative to the repository src root, or null. */
export function getSrcRelativePath(filename) {
  const normalized = normalizePath(filename);
  const index = normalized.lastIndexOf(SRC_MARKER);
  if (index === -1) {
    return normalized.startsWith('src/') ? normalized : null;
  }
  return `src/${normalized.slice(index + SRC_MARKER.length)}`;
}

/** Layer classification for a source file. */
export function getLayerInfo(filename) {
  const srcPath = getSrcRelativePath(filename);
  if (srcPath === null) {
    return { layer: 'outside', srcPath: null, moduleName: null, packageName: null };
  }
  const segments = srcPath.split('/');
  const top = segments[1] ?? '';
  if (top === 'modules') {
    return { layer: 'modules', srcPath, moduleName: segments[2] ?? null, packageName: null };
  }
  if (top === 'packages') {
    return { layer: 'packages', srcPath, moduleName: null, packageName: segments[2] ?? null };
  }
  if (top === 'app' || top === 'platform' || top === 'shared' || top === 'tests') {
    return { layer: top, srcPath, moduleName: null, packageName: null };
  }
  if (top === 'main.tsx' || top === 'vite-env.d.ts') {
    return { layer: 'root', srcPath, moduleName: null, packageName: null };
  }
  return { layer: 'unknown', srcPath, moduleName: null, packageName: null };
}

export function isInsideAnyDir(filename, dirs) {
  const srcPath = getSrcRelativePath(filename);
  if (srcPath === null) {
    return false;
  }
  return dirs.some((dir) => srcPath === dir || srcPath.startsWith(`${dir}/`));
}
