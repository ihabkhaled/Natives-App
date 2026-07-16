import { getFileKind, getLayerInfo } from './file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from './rule-helpers.mjs';

const BUSINESS_LOGIC_KINDS = new Set([
  'service',
  'gateway',
  'repository',
  'store',
  'query',
  'mutation',
]);

/** Factory banning feature business-logic file kinds from composition layers. */
export function createBusinessLogicBanRule({ description, layer, messageId, message }) {
  return {
    meta: createRuleMeta({ description, messages: { [messageId]: message } }),
    create(context) {
      const filename = context.filename;
      if (!isApplicationSource(filename) || isTestFile(filename)) {
        return {};
      }
      if (getLayerInfo(filename).layer !== layer) {
        return {};
      }
      const kind = getFileKind(filename);
      if (!BUSINESS_LOGIC_KINDS.has(kind)) {
        return {};
      }
      return {
        Program(node) {
          context.report({ node, messageId, data: { kind } });
        },
      };
    },
  };
}
