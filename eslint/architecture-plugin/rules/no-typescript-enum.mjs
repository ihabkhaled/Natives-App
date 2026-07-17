import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description:
      'The TypeScript enum keyword is forbidden; use as-const objects with derived unions.',
    messages: {
      enumForbidden:
        'TypeScript enum "{{name}}" is forbidden. Use an as-const object and a derived union type (rules/08).',
    },
  }),
  create(context) {
    if (!isApplicationSource(context.filename)) {
      return {};
    }
    return {
      TSEnumDeclaration(node) {
        context.report({ node, messageId: 'enumForbidden', data: { name: node.id.name } });
      },
    };
  },
};
