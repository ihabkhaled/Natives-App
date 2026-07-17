import { getFileKind } from '../shared/file-info.mjs';
import { classifyImport } from '../shared/import-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

const SERVER_STATE_SEGMENTS = ['/gateways/', '/queries/', '/mutations/'];
const SERVER_STATE_SUFFIXES = ['.gateway', '.query', '.mutation'];

export default {
  meta: createRuleMeta({
    description: 'Client stores hold client state only; remote data belongs to TanStack Query.',
    messages: {
      serverStateInStore:
        'Store file imports "{{source}}", which belongs to server state. Keep remote data in TanStack Query (rules/14, rules/15).',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || getFileKind(filename) !== 'store') {
      return {};
    }
    return {
      ImportDeclaration(node) {
        const source = String(node.source.value);
        const classified = classifyImport(filename, source);
        if (classified.kind !== 'internal' || classified.srcPath === undefined) {
          return;
        }
        const target = classified.srcPath;
        const isServerState =
          SERVER_STATE_SEGMENTS.some((segment) => target.includes(segment)) ||
          SERVER_STATE_SUFFIXES.some((suffix) => target.includes(suffix));
        if (isServerState) {
          context.report({ node, messageId: 'serverStateInStore', data: { source } });
        }
      },
    };
  },
};
