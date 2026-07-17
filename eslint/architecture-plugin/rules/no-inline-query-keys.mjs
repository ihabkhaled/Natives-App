import { getFileKind } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'Query keys come from *.keys.ts builders, never inline arrays.',
    messages: {
      inlineQueryKey:
        'Inline query key array is forbidden. Build keys in the module *.keys.ts file.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    if (getFileKind(filename) === 'keys') {
      return {};
    }
    return {
      Property(node) {
        if (
          node.key.type === 'Identifier' &&
          node.key.name === 'queryKey' &&
          node.value.type === 'ArrayExpression'
        ) {
          context.report({ node: node.value, messageId: 'inlineQueryKey' });
        }
      },
    };
  },
};
