import { someInSubtree } from './ast-walk.mjs';

function containsJsx(node) {
  return someInSubtree(node, (candidate) => {
    return candidate.type === 'JSXElement' || candidate.type === 'JSXFragment';
  });
}

function isCapitalized(name) {
  return /^[A-Z]/u.test(name);
}

function asComponentDeclaration(declaration) {
  if (
    (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') &&
    declaration.id !== null &&
    isCapitalized(declaration.id.name) &&
    containsJsx(declaration.body)
  ) {
    return { name: declaration.id.name, node: declaration };
  }
  return null;
}

function componentDeclaratorsIn(declaration) {
  const found = [];
  for (const declarator of declaration.declarations) {
    if (
      declarator.id.type === 'Identifier' &&
      isCapitalized(declarator.id.name) &&
      declarator.init !== null &&
      (declarator.init.type === 'ArrowFunctionExpression' ||
        declarator.init.type === 'FunctionExpression') &&
      containsJsx(declarator.init.body)
    ) {
      found.push({ name: declarator.id.name, node: declarator });
    }
  }
  return found;
}

/** Collect module-scope React component declarations (JSX-returning, capitalized). */
export function collectComponentDeclarations(programNode) {
  const components = [];
  for (const statement of programNode.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration'
        ? statement.declaration
        : statement;
    if (declaration === null || declaration === undefined) {
      continue;
    }
    if (declaration.type === 'VariableDeclaration') {
      components.push(...componentDeclaratorsIn(declaration));
      continue;
    }
    const component = asComponentDeclaration(declaration);
    if (component !== null) {
      components.push(component);
    }
  }
  return components;
}
