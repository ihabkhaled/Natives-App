import { getBasename, getFileKind, normalizePath } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description:
      'Every *.component.tsx lives in a folder named after the component (component-folder contract).',
    messages: {
      folderMismatch:
        'Component file "{{base}}" must live in a folder named "{{expected}}" (found "{{actual}}").',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || getFileKind(filename) !== 'component') {
      return {};
    }
    return {
      Program(node) {
        const normalized = normalizePath(filename);
        const base = getBasename(filename);
        const expected = base.replace(/\.component\.tsx$/u, '');
        const segments = normalized.split('/');
        const actual = segments[segments.length - 2] ?? '';
        if (actual !== expected) {
          context.report({
            node,
            messageId: 'folderMismatch',
            data: { base, expected, actual },
          });
        }
      },
    };
  },
};
