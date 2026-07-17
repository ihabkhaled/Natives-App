import { getFileKind } from '../shared/file-info.mjs';
import { isHookName } from '../shared/hook-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const HOOK_HOME_KINDS = new Set(['hook', 'store']);

export default {
  meta: createRuleMeta({
    description: 'Exported use* functions live in *.hook.ts files (stores may export use*Store).',
    messages: {
      hookOutsideHookFile:
        'Exported hook "{{name}}" belongs in a *.hook.ts file, not a "{{kind}}" file.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    const kind = getFileKind(filename);
    if (HOOK_HOME_KINDS.has(kind) || kind === 'index') {
      return {};
    }
    return {
      ExportNamedDeclaration(node) {
        const declaration = node.declaration;
        if (declaration === null || declaration === undefined) {
          return;
        }
        if (
          declaration.type === 'FunctionDeclaration' &&
          declaration.id !== null &&
          isHookName(declaration.id.name)
        ) {
          context.report({
            node: declaration,
            messageId: 'hookOutsideHookFile',
            data: { name: declaration.id.name, kind },
          });
        }
      },
    };
  },
};
