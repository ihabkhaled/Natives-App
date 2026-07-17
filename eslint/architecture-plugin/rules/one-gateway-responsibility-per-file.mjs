import { getFileKind } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description:
      'A *.gateway.ts file owns one backend resource: every export is a request* function.',
    messages: {
      nonRequestExport:
        'Gateway export "{{name}}" must be a request-prefixed endpoint function; move other declarations to companion files.',
    },
  }),
  create(context) {
    if (!isApplicationSource(context.filename) || getFileKind(context.filename) !== 'gateway') {
      return {};
    }
    return {
      ExportNamedDeclaration(node) {
        const declaration = node.declaration;
        if (declaration === null || node.exportKind === 'type') {
          return;
        }
        if (declaration.type === 'FunctionDeclaration' && declaration.id !== null) {
          if (!/^request[A-Z]/u.test(declaration.id.name)) {
            context.report({
              node: declaration,
              messageId: 'nonRequestExport',
              data: { name: declaration.id.name },
            });
          }
          return;
        }
        if (
          declaration.type === 'TSInterfaceDeclaration' ||
          declaration.type === 'TSTypeAliasDeclaration'
        ) {
          return;
        }
        context.report({
          node: declaration,
          messageId: 'nonRequestExport',
          data: { name: 'non-function export' },
        });
      },
    };
  },
};
