import { getFileKind } from '../shared/file-info.mjs';
import { isHookName } from '../shared/hook-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

function isFunctionValued(declarator) {
  return (
    declarator.id.type === 'Identifier' &&
    declarator.init !== null &&
    (declarator.init.type === 'ArrowFunctionExpression' ||
      declarator.init.type === 'FunctionExpression')
  );
}

function exportedFunctionsOf(statement) {
  if (statement.type !== 'ExportNamedDeclaration' || statement.declaration === null) {
    return [];
  }
  const declaration = statement.declaration;
  if (declaration.type === 'FunctionDeclaration' && declaration.id !== null) {
    return [{ name: declaration.id.name, node: declaration }];
  }
  if (declaration.type === 'VariableDeclaration') {
    return declaration.declarations
      .filter((declarator) => isFunctionValued(declarator))
      .map((declarator) => ({ name: declarator.id.name, node: declarator }));
  }
  return [];
}

export default {
  meta: createRuleMeta({
    description: 'A *.hook.ts file exports exactly one primary hook.',
    messages: {
      extraHook: 'Hook file already exports "{{first}}"; move "{{name}}" to its own hook file.',
      nonHookExport:
        'Hook files export one primary use* hook; "{{name}}" is not a hook. Move it to a helper or companion file.',
    },
  }),
  create(context) {
    if (!isApplicationSource(context.filename) || getFileKind(context.filename) !== 'hook') {
      return {};
    }
    return {
      Program(node) {
        const exported = node.body.flatMap((statement) => exportedFunctionsOf(statement));
        const hooks = exported.filter((entry) => isHookName(entry.name));
        for (const entry of exported) {
          if (!isHookName(entry.name)) {
            context.report({
              node: entry.node,
              messageId: 'nonHookExport',
              data: { name: entry.name },
            });
          }
        }
        for (const extra of hooks.slice(1)) {
          context.report({
            node: extra.node,
            messageId: 'extraHook',
            data: { first: hooks[0].name, name: extra.name },
          });
        }
      },
    };
  },
};
