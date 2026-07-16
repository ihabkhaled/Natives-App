import { getLayerInfo } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const STORAGE_GLOBALS = new Set(['localStorage', 'sessionStorage', 'indexedDB']);

export default {
  meta: createRuleMeta({
    description:
      'Web storage primitives are reached only through the platform storage facade or the secure-storage owner.',
    messages: {
      storageApi:
        'Direct storage API "{{name}}" outside its owner. Persist through @/platform storage or @/packages/secure-storage.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    const layer = getLayerInfo(filename).layer;
    if (layer === 'platform' || layer === 'packages') {
      return {};
    }
    return {
      Identifier(node) {
        if (!STORAGE_GLOBALS.has(node.name)) {
          return;
        }
        const parent = node.parent;
        const isGlobalMember =
          parent.type === 'MemberExpression' &&
          parent.property === node &&
          parent.object.type === 'Identifier' &&
          (parent.object.name === 'globalThis' || parent.object.name === 'window');
        const isBareReference =
          parent.type !== 'MemberExpression' ||
          parent.object === node ||
          isGlobalMember;
        if (
          isBareReference &&
          parent.type !== 'Property' &&
          parent.type !== 'TSPropertySignature'
        ) {
          context.report({ node, messageId: 'storageApi', data: { name: node.name } });
        }
      },
    };
  },
};
