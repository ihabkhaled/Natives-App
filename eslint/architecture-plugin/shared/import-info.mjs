import { getLayerInfo, getSrcRelativePath } from './file-info.mjs';

function resolveRelativeSegments(baseDir, source) {
  const combined = `${baseDir}/${source}`.split('/');
  const resolved = [];
  for (const segment of combined) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }
  return resolved.join('/');
}

/**
 * Classify an import source from the perspective of the importing file.
 * Returns { kind: 'vendor' | 'internal' | 'unknown', packageName?, srcPath? }.
 */
export function classifyImport(importerFilename, source) {
  if (source.startsWith('@/')) {
    return { kind: 'internal', srcPath: `src/${source.slice(2)}` };
  }
  if (source.startsWith('.')) {
    const importerSrcPath = getSrcRelativePath(importerFilename);
    if (importerSrcPath === null) {
      return { kind: 'unknown' };
    }
    const importerDir = importerSrcPath.slice(0, importerSrcPath.lastIndexOf('/'));
    return { kind: 'internal', srcPath: resolveRelativeSegments(importerDir, source) };
  }
  const segments = source.split('/');
  const packageName = source.startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0];
  return { kind: 'vendor', packageName, subpath: source };
}

/** Layer info for an internal import target. */
export function getImportLayerInfo(importerFilename, source) {
  const classified = classifyImport(importerFilename, source);
  if (classified.kind !== 'internal' || classified.srcPath === undefined) {
    return null;
  }
  return getLayerInfo(classified.srcPath);
}

export function isTypeOnlyImport(node) {
  if (node.importKind === 'type') {
    return true;
  }
  return (
    node.specifiers.length > 0 &&
    node.specifiers.every((specifier) => specifier.importKind === 'type')
  );
}
