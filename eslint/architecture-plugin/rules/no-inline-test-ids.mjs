import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'data-testid values come from TEST_IDS constants, never JSX string literals.',
    messages: {
      inlineTestId:
        'Raw data-testid literal. Reference TEST_IDS from @/shared/config through a companion constants file.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    return {
      JSXAttribute(node) {
        if (
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'data-testid' &&
          node.value !== null &&
          node.value.type === 'Literal'
        ) {
          context.report({ node, messageId: 'inlineTestId' });
        }
      },
    };
  },
};
