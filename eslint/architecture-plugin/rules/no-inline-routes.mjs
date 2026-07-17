import { getFileKind } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const ALLOWED_KINDS = new Set(['paths', 'constants', 'schema']);
const PATH_LITERAL = /^\/(?!\/)/u;

export default {
  meta: createRuleMeta({
    description:
      'Raw route and endpoint path strings live only in *.paths.ts and *.constants.ts files.',
    messages: {
      inlinePath:
        'Raw path string "{{value}}" is forbidden here. Use a typed builder from *.paths.ts or a constant from *.constants.ts.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    if (ALLOWED_KINDS.has(getFileKind(filename))) {
      return {};
    }
    return {
      Literal(node) {
        if (typeof node.value === 'string' && PATH_LITERAL.test(node.value)) {
          context.report({ node, messageId: 'inlinePath', data: { value: node.value } });
        }
      },
    };
  },
};
