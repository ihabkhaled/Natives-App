import { getLayerInfo } from '../shared/file-info.mjs';
import { getImportLayerInfo } from '../shared/import-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description: 'Modules communicate only through their public index.ts surfaces.',
    messages: {
      deepImport:
        'Deep import into module "{{module}}". Import from "@/modules/{{module}}" (its public surface) instead.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    const importerInfo = getLayerInfo(filename);
    return {
      ImportDeclaration(node) {
        const targetInfo = getImportLayerInfo(filename, String(node.source.value));
        if (targetInfo === null || targetInfo.layer !== 'modules' || targetInfo.moduleName === null) {
          return;
        }
        if (importerInfo.layer === 'modules' && importerInfo.moduleName === targetInfo.moduleName) {
          return;
        }
        const isPublicSurface =
          targetInfo.srcPath === `src/modules/${targetInfo.moduleName}` ||
          targetInfo.srcPath === `src/modules/${targetInfo.moduleName}/index.ts`;
        if (!isPublicSurface) {
          context.report({
            node,
            messageId: 'deepImport',
            data: { module: targetInfo.moduleName },
          });
        }
      },
    };
  },
};
