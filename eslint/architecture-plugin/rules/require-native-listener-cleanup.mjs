import { collectInSubtree, someInSubtree } from '../shared/ast-walk.mjs';
import { isListenerRegistrationCall } from '../shared/listener-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

function isEffectCallback(node) {
  return (
    node !== undefined &&
    (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression')
  );
}

function returnsCleanup(effectCallback) {
  if (effectCallback.body.type !== 'BlockStatement') {
    return true;
  }
  return someInSubtree(
    effectCallback.body,
    (node) => node.type === 'ReturnStatement' && node.argument !== null,
    { skipNestedFunctions: true },
  );
}

export default {
  meta: createRuleMeta({
    description: 'Effects that register native listeners must return a cleanup function.',
    messages: {
      missingCleanup:
        'useEffect registers "{{name}}" but returns no cleanup. Return a function that unsubscribes.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useEffect') {
          return;
        }
        const effectCallback = node.arguments[0];
        if (!isEffectCallback(effectCallback)) {
          return;
        }
        const registrations = collectInSubtree(effectCallback.body, isListenerRegistrationCall);
        if (registrations.length > 0 && !returnsCleanup(effectCallback)) {
          context.report({
            node: registrations[0],
            messageId: 'missingCleanup',
            data: { name: registrations[0].callee.name },
          });
        }
      },
    };
  },
};
