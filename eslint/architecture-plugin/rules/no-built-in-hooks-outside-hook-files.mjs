import { getFileKind } from '../shared/file-info.mjs';
import { BUILT_IN_HOOKS, getCalledHookName } from '../shared/hook-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'Built-in React hooks may only be invoked inside *.hook.ts files.',
    messages: {
      builtInHookOutsideHookFile:
        'Built-in hook "{{name}}" belongs in a dedicated *.hook.ts file, not in a "{{kind}}" file.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    const kind = getFileKind(filename);
    if (kind === 'hook') {
      return {};
    }
    return {
      CallExpression(node) {
        const hookName = getCalledHookName(node);
        if (hookName !== null && BUILT_IN_HOOKS.has(hookName)) {
          context.report({
            node,
            messageId: 'builtInHookOutsideHookFile',
            data: { name: hookName, kind },
          });
        }
      },
    };
  },
};
