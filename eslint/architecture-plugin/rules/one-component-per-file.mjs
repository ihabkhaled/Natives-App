import { collectComponentDeclarations } from '../shared/component-info.mjs';
import { getFileKind, isComponentFamily } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'Each UI file declares exactly one React component.',
    messages: {
      extraComponent:
        'File already declares component "{{first}}"; "{{name}}" needs its own component folder.',
      componentOutsideUiFile:
        'React component "{{name}}" declared in a "{{kind}}" file. Components live in *.component.tsx (or container/provider/guard/boundary/routes files).',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    const kind = getFileKind(filename);
    return {
      Program(node) {
        const components = collectComponentDeclarations(node);
        if (components.length === 0) {
          return;
        }
        if (!isComponentFamily(kind) && kind !== 'main') {
          for (const component of components) {
            context.report({
              node: component.node,
              messageId: 'componentOutsideUiFile',
              data: { name: component.name, kind },
            });
          }
          return;
        }
        const first = components[0];
        for (const component of components.slice(1)) {
          context.report({
            node: component.node,
            messageId: 'extraComponent',
            data: { first: first.name, name: component.name },
          });
        }
      },
    };
  },
};
