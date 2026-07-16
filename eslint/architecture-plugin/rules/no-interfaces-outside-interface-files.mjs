import { getFileKind, isComponentFamily } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description:
      'UI-family files externalize every supporting interface into a companion *.types.ts or *.interfaces.ts file.',
    messages: {
      inlineInterface:
        'Interface "{{name}}" is forbidden in a "{{kind}}" file. Move it to the companion *.types.ts or *.interfaces.ts file.',
    },
  }),
  create(context) {
    const kind = getFileKind(context.filename);
    if (!isApplicationSource(context.filename) || !isComponentFamily(kind)) {
      return {};
    }
    return {
      TSInterfaceDeclaration(node) {
        context.report({
          node,
          messageId: 'inlineInterface',
          data: { name: node.id.name, kind },
        });
      },
    };
  },
};
