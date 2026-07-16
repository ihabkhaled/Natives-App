import { getFileKind } from '../shared/file-info.mjs';
import { getCalledHookName } from '../shared/hook-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'Presentational *.component.tsx files must not invoke any hook.',
    messages: {
      hookInComponent:
        'Hook "{{name}}" is forbidden in a presentational component. Move it to a container or a dedicated *.hook.ts file.',
    },
  }),
  create(context) {
    if (!isApplicationSource(context.filename) || getFileKind(context.filename) !== 'component') {
      return {};
    }
    return {
      CallExpression(node) {
        const hookName = getCalledHookName(node);
        if (hookName !== null) {
          context.report({ node, messageId: 'hookInComponent', data: { name: hookName } });
        }
      },
    };
  },
};
