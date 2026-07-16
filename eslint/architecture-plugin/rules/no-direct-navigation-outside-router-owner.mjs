import { getLayerInfo } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const HISTORY_MUTATORS = new Set(['pushState', 'replaceState', 'back', 'forward', 'go']);
const LOCATION_MUTATORS = new Set(['assign', 'replace', 'reload']);

export default {
  meta: createRuleMeta({
    description:
      'Browser history and location are driven only through the router owner and platform facades.',
    messages: {
      directNavigation:
        'Direct "{{api}}" navigation bypasses the router owner. Use @/packages/router or a platform facade.',
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
      MemberExpression(node) {
        if (node.property.type !== 'Identifier') {
          return;
        }
        const objectName =
          node.object.type === 'Identifier'
            ? node.object.name
            : node.object.type === 'MemberExpression' && node.object.property.type === 'Identifier'
              ? node.object.property.name
              : null;
        if (objectName === 'history' && HISTORY_MUTATORS.has(node.property.name)) {
          context.report({
            node,
            messageId: 'directNavigation',
            data: { api: `history.${node.property.name}` },
          });
        }
        if (objectName === 'location' && LOCATION_MUTATORS.has(node.property.name)) {
          context.report({
            node,
            messageId: 'directNavigation',
            data: { api: `location.${node.property.name}` },
          });
        }
      },
    };
  },
};
