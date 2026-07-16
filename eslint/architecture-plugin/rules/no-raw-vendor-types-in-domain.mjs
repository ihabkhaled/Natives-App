import { FOUNDATIONAL_VENDORS } from '../../package-ownership.config.mjs';
import { getLayerInfo } from '../shared/file-info.mjs';
import { classifyImport, isTypeOnlyImport } from '../shared/import-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description:
      'Feature modules use app-owned types; raw vendor type imports leak vendor contracts into the domain.',
    messages: {
      vendorTypeInDomain:
        'Vendor type import from "{{vendor}}" inside a feature module. Re-export the type from its owner package.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    if (getLayerInfo(filename).layer !== 'modules') {
      return {};
    }
    return {
      ImportDeclaration(node) {
        if (!isTypeOnlyImport(node)) {
          return;
        }
        const classified = classifyImport(filename, String(node.source.value));
        if (
          classified.kind === 'vendor' &&
          !FOUNDATIONAL_VENDORS.includes(classified.packageName)
        ) {
          context.report({
            node,
            messageId: 'vendorTypeInDomain',
            data: { vendor: classified.packageName },
          });
        }
      },
    };
  },
};
