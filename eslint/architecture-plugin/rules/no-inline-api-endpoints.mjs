import { getFileKind } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'download',
  'postMultipart',
]);

export default {
  meta: createRuleMeta({
    description: 'HTTP client calls receive endpoint constants, never string literals.',
    messages: {
      inlineEndpoint:
        'Endpoint literal passed to http client "{{method}}". Reference an api-path constant instead.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    if (getFileKind(filename) === 'constants') {
      return {};
    }
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.property.type !== 'Identifier' ||
          !HTTP_METHODS.has(callee.property.name)
        ) {
          return;
        }
        const firstArg = node.arguments[0];
        if (
          firstArg !== undefined &&
          firstArg.type === 'Literal' &&
          typeof firstArg.value === 'string'
        ) {
          context.report({
            node: firstArg,
            messageId: 'inlineEndpoint',
            data: { method: callee.property.name },
          });
        }
      },
    };
  },
};
