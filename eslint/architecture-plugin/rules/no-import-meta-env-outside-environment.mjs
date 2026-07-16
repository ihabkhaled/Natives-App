import { isInsideAnyDir } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

const ENVIRONMENT_OWNER_DIRS = ['src/packages/environment'];

export default {
  meta: createRuleMeta({
    description: 'import.meta.env is read only inside the environment owner.',
    messages: {
      envAccess:
        'import.meta.env is forbidden here. Read validated configuration from @/packages/environment.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isInsideAnyDir(filename, ENVIRONMENT_OWNER_DIRS)) {
      return {};
    }
    return {
      MetaProperty(node) {
        const parent = node.parent;
        if (
          parent.type === 'MemberExpression' &&
          parent.property.type === 'Identifier' &&
          parent.property.name === 'env'
        ) {
          context.report({ node: parent, messageId: 'envAccess' });
        }
      },
    };
  },
};
