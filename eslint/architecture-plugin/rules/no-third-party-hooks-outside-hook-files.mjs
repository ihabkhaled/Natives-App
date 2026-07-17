import { getFileKind } from '../shared/file-info.mjs';
import { collectImportBindings, getCalledHookName } from '../shared/hook-info.mjs';
import { classifyImport } from '../shared/import-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

export default {
  meta: createRuleMeta({
    description:
      'Hooks imported from third-party packages may only be invoked inside *.hook.ts files.',
    messages: {
      vendorHookOutsideHookFile:
        'Vendor hook "{{name}}" (from "{{source}}") belongs in a dedicated *.hook.ts file.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    if (getFileKind(filename) === 'hook') {
      return {};
    }
    let bindings = new Map();
    return {
      Program(node) {
        bindings = collectImportBindings(node);
      },
      CallExpression(node) {
        const hookName = getCalledHookName(node);
        if (hookName === null) {
          return;
        }
        const binding = bindings.get(hookName);
        if (binding === undefined || binding.importKind === 'type') {
          return;
        }
        if (classifyImport(filename, binding.source).kind === 'vendor') {
          context.report({
            node,
            messageId: 'vendorHookOutsideHookFile',
            data: { name: hookName, source: binding.source },
          });
        }
      },
    };
  },
};
