import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'Application source uses named exports only.',
    messages: {
      defaultExport: 'Default exports are forbidden in application source; use a named export.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    return {
      ExportDefaultDeclaration(node) {
        context.report({ node, messageId: 'defaultExport' });
      },
    };
  },
};
