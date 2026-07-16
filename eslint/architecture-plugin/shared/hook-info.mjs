export const BUILT_IN_HOOKS = new Set([
  'use',
  'useActionState',
  'useCallback',
  'useContext',
  'useDebugValue',
  'useDeferredValue',
  'useEffect',
  'useId',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
  'useOptimistic',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
]);

export function isHookName(name) {
  return /^use[A-Z0-9]/u.test(name) || name === 'use';
}

/** Name of the called hook, or null when the call is not a direct hook call. */
export function getCalledHookName(callExpression) {
  const callee = callExpression.callee;
  if (callee.type === 'Identifier' && isHookName(callee.name)) {
    return callee.name;
  }
  return null;
}

/** Collect local names imported from each module source. */
export function collectImportBindings(programNode) {
  const bindings = new Map();
  for (const statement of programNode.body) {
    if (statement.type !== 'ImportDeclaration') {
      continue;
    }
    for (const specifier of statement.specifiers) {
      bindings.set(specifier.local.name, {
        source: statement.source.value,
        importKind:
          statement.importKind === 'type' || specifier.importKind === 'type' ? 'type' : 'value',
      });
    }
  }
  return bindings;
}
