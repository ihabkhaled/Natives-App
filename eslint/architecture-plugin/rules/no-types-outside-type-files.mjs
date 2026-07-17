import { getFileKind, isComponentFamily } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description:
      'UI-family files externalize every supporting type alias into a companion *.types.ts file.',
    messages: {
      inlineType:
        'Type alias "{{name}}" is forbidden in a "{{kind}}" file. Move it to the companion *.types.ts file.',
    },
  }),
  create(context) {
    const kind = getFileKind(context.filename);
    if (!isApplicationSource(context.filename) || !isComponentFamily(kind)) {
      return {};
    }
    return {
      TSTypeAliasDeclaration(node) {
        context.report({
          node,
          messageId: 'inlineType',
          data: { name: node.id.name, kind },
        });
      },
    };
  },
};
