import { getFileKind } from './file-info.mjs';
import { createRuleMeta, isApplicationSource } from './rule-helpers.mjs';

const REACT_PACKAGES = new Set(['react', 'react-dom']);

/** Factory for the React-free layer rule family. */
export function createReactFreeRule({ description, kinds }) {
  return {
    meta: createRuleMeta({
      description,
      messages: {
        reactForbidden:
          'React import is forbidden in a "{{kind}}" file; this layer must stay framework-free.',
      },
    }),
    create(context) {
      const filename = context.filename;
      if (!isApplicationSource(filename)) {
        return {};
      }
      const kind = getFileKind(filename);
      if (!kinds.includes(kind)) {
        return {};
      }
      return {
        ImportDeclaration(node) {
          const source = String(node.source.value);
          const packageName = source.split('/')[0];
          if (REACT_PACKAGES.has(packageName)) {
            context.report({ node, messageId: 'reactForbidden', data: { kind } });
          }
        },
      };
    },
  };
}
