import { getLayerInfo } from './file-info.mjs';
import { getImportLayerInfo } from './import-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from './rule-helpers.mjs';

/** Factory for rules banning imports of one layer from another. */
export function createLayerImportBanRule({ description, fromLayers, bannedTargetLayers, messageId, message }) {
  return {
    meta: createRuleMeta({ description, messages: { [messageId]: message } }),
    create(context) {
      const filename = context.filename;
      if (!isApplicationSource(filename) || isTestFile(filename)) {
        return {};
      }
      const fromLayer = getLayerInfo(filename).layer;
      if (!fromLayers.includes(fromLayer)) {
        return {};
      }
      return {
        ImportDeclaration(node) {
          const targetInfo = getImportLayerInfo(filename, String(node.source.value));
          if (targetInfo !== null && bannedTargetLayers.includes(targetInfo.layer)) {
            context.report({ node, messageId, data: { target: targetInfo.layer } });
          }
        },
      };
    },
  };
}
