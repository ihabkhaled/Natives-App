function isAstNode(value) {
  return value !== null && typeof value === 'object' && typeof value.type === 'string';
}

function isFunctionNode(node) {
  return (
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  );
}

function childNodesOf(node) {
  const children = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || value === null || typeof value !== 'object') {
      continue;
    }
    const candidates = Array.isArray(value) ? value : [value];
    for (const candidate of candidates) {
      if (isAstNode(candidate)) {
        children.push(candidate);
      }
    }
  }
  return children;
}

/** Depth-first search for any node matching the predicate. */
export function someInSubtree(root, predicate, options = {}) {
  const skipNestedFunctions = options.skipNestedFunctions === true;
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (predicate(node)) {
      return true;
    }
    if (skipNestedFunctions && node !== root && isFunctionNode(node)) {
      continue;
    }
    stack.push(...childNodesOf(node));
  }
  return false;
}

/** Collect every node in the subtree matching the predicate. */
export function collectInSubtree(root, predicate) {
  const matches = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (predicate(node)) {
      matches.push(node);
    }
    stack.push(...childNodesOf(node));
  }
  return matches;
}
