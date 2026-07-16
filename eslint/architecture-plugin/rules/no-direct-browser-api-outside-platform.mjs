import { getBasename, getLayerInfo } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const BROWSER_GLOBALS = new Set([
  'document',
  'window',
  'navigator',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'matchMedia',
  'location',
]);

export default {
  meta: createRuleMeta({
    description: 'Browser APIs are reached only through platform facades or package owners.',
    messages: {
      browserApi:
        'Direct browser API "{{name}}" outside the platform layer. Add or use a platform facade.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    const layer = getLayerInfo(filename).layer;
    if (layer === 'platform' || layer === 'packages' || getBasename(filename) === 'main.tsx') {
      return {};
    }
    const report = (node, name) => {
      context.report({ node, messageId: 'browserApi', data: { name } });
    };
    return {
      Identifier(node) {
        if (!BROWSER_GLOBALS.has(node.name)) {
          return;
        }
        const parent = node.parent;
        if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) {
          if (
            parent.object.type === 'Identifier' &&
            (parent.object.name === 'globalThis' || parent.object.name === 'window')
          ) {
            report(node, `globalThis.${node.name}`);
          }
          return;
        }
        if (
          parent.type === 'Property' ||
          parent.type === 'ImportSpecifier' ||
          parent.type === 'TSPropertySignature' ||
          parent.type === 'TSTypeReference'
        ) {
          return;
        }
        const scope = context.sourceCode.getScope(node);
        const variable = scope.references.find((ref) => ref.identifier === node)?.resolved;
        if (variable !== undefined && variable !== null && variable.defs.length > 0) {
          return;
        }
        report(node, node.name);
      },
    };
  },
};
