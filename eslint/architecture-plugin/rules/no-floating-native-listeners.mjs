import { isListenerRegistrationCall } from '../shared/listener-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'Listener registrations return a cleanup handle that must be captured.',
    messages: {
      floatingListener:
        'Cleanup handle from "{{name}}" is discarded. Capture it and unsubscribe on teardown.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    return {
      ExpressionStatement(node) {
        if (isListenerRegistrationCall(node.expression)) {
          context.report({
            node,
            messageId: 'floatingListener',
            data: { name: node.expression.callee.name },
          });
        }
      },
    };
  },
};
