import { getFileKind } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'A *.service.ts file exports exactly one use-case function.',
    messages: {
      extraUseCase:
        'Service file already exports use case "{{first}}"; "{{name}}" is a second use case and needs its own service file.',
    },
  }),
  create(context) {
    if (!isApplicationSource(context.filename) || getFileKind(context.filename) !== 'service') {
      return {};
    }
    return {
      Program(node) {
        const exportedFunctions = [];
        for (const statement of node.body) {
          if (statement.type !== 'ExportNamedDeclaration' || statement.declaration === null) {
            continue;
          }
          const declaration = statement.declaration;
          if (declaration.type === 'FunctionDeclaration' && declaration.id !== null) {
            exportedFunctions.push({ name: declaration.id.name, node: declaration });
          }
        }
        for (const extra of exportedFunctions.slice(1)) {
          context.report({
            node: extra.node,
            messageId: 'extraUseCase',
            data: { first: exportedFunctions[0].name, name: extra.name },
          });
        }
      },
    };
  },
};
