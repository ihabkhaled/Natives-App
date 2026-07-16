import { createRuleMeta } from '../shared/rule-helpers.mjs';

const DISABLE_PATTERN = /eslint-disable/u;
const EXCEPTION_REFERENCE = /EXC-\d{4}/u;

export default {
  meta: createRuleMeta({
    description:
      'Every eslint-disable comment must cite a documented exception identifier (EXC-nnnn).',
    messages: {
      undocumentedDisable:
        'eslint-disable without an EXC-nnnn exception reference. Document the exception in docs/exceptions first.',
    },
  }),
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (DISABLE_PATTERN.test(comment.value) && !EXCEPTION_REFERENCE.test(comment.value)) {
            context.report({ loc: comment.loc, messageId: 'undocumentedDisable' });
          }
        }
      },
    };
  },
};
