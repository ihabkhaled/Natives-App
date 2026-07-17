import { getLayerInfo } from '../shared/file-info.mjs';
import { getImportLayerInfo } from '../shared/import-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

/** One-way dependency direction: app → modules → platform → shared → packages. */
const ALLOWED_TARGETS = {
  root: ['app', 'modules', 'platform', 'shared', 'packages', 'tests', 'root'],
  app: ['app', 'modules', 'platform', 'shared', 'packages', 'tests'],
  modules: ['modules', 'platform', 'shared', 'packages'],
  platform: ['platform', 'shared', 'packages'],
  shared: ['shared', 'packages'],
  packages: ['packages'],
  tests: ['app', 'modules', 'platform', 'shared', 'packages', 'tests'],
};

export default {
  meta: createRuleMeta({
    description:
      'Layer imports follow the one-way direction app → modules → platform → shared → packages.',
    messages: {
      restrictedLayer:
        'Layer "{{from}}" must not import from layer "{{to}}". Allowed targets: {{allowed}}.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    const fromLayer = getLayerInfo(filename).layer;
    const allowed = ALLOWED_TARGETS[fromLayer];
    if (allowed === undefined) {
      return {};
    }
    return {
      ImportDeclaration(node) {
        const targetInfo = getImportLayerInfo(filename, String(node.source.value));
        if (
          targetInfo === null ||
          targetInfo.layer === 'outside' ||
          targetInfo.layer === 'unknown'
        ) {
          return;
        }
        if (!allowed.includes(targetInfo.layer)) {
          context.report({
            node,
            messageId: 'restrictedLayer',
            data: { from: fromLayer, to: targetInfo.layer, allowed: allowed.join(', ') },
          });
        }
      },
    };
  },
};
