import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const ERROR_IDENTIFIER = /^(?:error|err|exception)$/iu;

function isErrorMessageAccess(expression) {
  return (
    expression.type === 'MemberExpression' &&
    expression.property.type === 'Identifier' &&
    expression.property.name === 'message' &&
    ((expression.object.type === 'Identifier' && ERROR_IDENTIFIER.test(expression.object.name)) ||
      (expression.object.type === 'MemberExpression' &&
        expression.object.property.type === 'Identifier' &&
        ERROR_IDENTIFIER.test(expression.object.property.name)))
  );
}

export default {
  meta: createRuleMeta({
    description:
      'Raw error objects and error.message never render to users; map codes to i18n copy.',
    messages: {
      unsafeErrorDisplay:
        'Rendering a raw error is forbidden. Map the error code to translated copy (shared/mappers).',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    return {
      JSXExpressionContainer(node) {
        if (node.parent.type === 'JSXAttribute') {
          return;
        }
        const expression = node.expression;
        if (
          isErrorMessageAccess(expression) ||
          (expression.type === 'Identifier' && ERROR_IDENTIFIER.test(expression.name))
        ) {
          context.report({ node, messageId: 'unsafeErrorDisplay' });
        }
      },
    };
  },
};
