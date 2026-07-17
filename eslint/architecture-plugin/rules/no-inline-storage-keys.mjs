import { getLayerInfo } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const STORAGE_CALLEES = new Set([
  'getSecureValue',
  'setSecureValue',
  'removeSecureValue',
  'getPreferenceValue',
  'setPreferenceValue',
  'removePreferenceValue',
]);

export default {
  meta: createRuleMeta({
    description: 'Storage facades receive STORAGE_KEYS constants, never string literals.',
    messages: {
      inlineStorageKey:
        'Raw storage key passed to "{{callee}}". Use STORAGE_KEYS from @/shared/config.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    if (getLayerInfo(filename).layer === 'packages') {
      return {};
    }
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || !STORAGE_CALLEES.has(node.callee.name)) {
          return;
        }
        const firstArg = node.arguments[0];
        if (firstArg !== undefined && firstArg.type === 'Literal') {
          context.report({
            node: firstArg,
            messageId: 'inlineStorageKey',
            data: { callee: node.callee.name },
          });
        }
      },
    };
  },
};
