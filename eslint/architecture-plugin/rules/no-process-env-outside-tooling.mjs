import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'process.env belongs to Node tooling, never application source.',
    messages: {
      processEnv:
        'process.env is forbidden in application source. Use @/packages/environment (Vite variables).',
    },
  }),
  create(context) {
    if (!isApplicationSource(context.filename)) {
      return {};
    }
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'process' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'env'
        ) {
          context.report({ node, messageId: 'processEnv' });
        }
      },
    };
  },
};
