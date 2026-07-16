import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getLayerInfo, normalizePath } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

const checkedModules = new Map();

export default {
  meta: createRuleMeta({
    description: 'Every feature module exposes a public index.ts surface.',
    messages: {
      missingIndex:
        'Module "{{module}}" has no public index.ts surface. Create src/modules/{{module}}/index.ts.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename)) {
      return {};
    }
    const info = getLayerInfo(filename);
    if (info.layer !== 'modules' || info.moduleName === null) {
      return {};
    }
    return {
      Program(node) {
        const moduleName = info.moduleName;
        if (!checkedModules.has(moduleName)) {
          const normalized = normalizePath(filename);
          const moduleRoot = normalized.slice(
            0,
            normalized.indexOf(`/modules/${moduleName}/`) + `/modules/${moduleName}`.length + 1,
          );
          checkedModules.set(moduleName, existsSync(join(moduleRoot, 'index.ts')));
        }
        if (checkedModules.get(moduleName) === false) {
          context.report({ node, messageId: 'missingIndex', data: { module: moduleName } });
        }
      },
    };
  },
};
