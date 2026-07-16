import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const HAS_LETTERS = /\p{L}/u;

export default {
  meta: createRuleMeta({
    description:
      'User-visible copy never appears as raw JSX text; it arrives translated through props or hooks.',
    messages: {
      rawText:
        'Raw user-visible text "{{text}}" in JSX. Provide translated copy through the i18n pipeline.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    return {
      JSXText(node) {
        const text = node.value.trim();
        if (text !== '' && HAS_LETTERS.test(text)) {
          context.report({ node, messageId: 'rawText', data: { text: text.slice(0, 30) } });
        }
      },
      JSXExpressionContainer(node) {
        if (
          node.expression.type === 'Literal' &&
          typeof node.expression.value === 'string' &&
          HAS_LETTERS.test(node.expression.value) &&
          node.parent.type !== 'JSXAttribute'
        ) {
          context.report({
            node,
            messageId: 'rawText',
            data: { text: node.expression.value.slice(0, 30) },
          });
        }
      },
    };
  },
};
