import { getFileKind } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

const FORBIDDEN_STATEMENTS = new Set([
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchStatement',
  'TryStatement',
]);

export default {
  meta: createRuleMeta({
    description:
      'Presentational components render prepared props; control-flow statements indicate misplaced logic.',
    messages: {
      inlineLogic:
        '{{statement}} is forbidden in a presentational component. Prepare data in a hook, helper, or mapper.',
    },
  }),
  create(context) {
    if (!isApplicationSource(context.filename) || getFileKind(context.filename) !== 'component') {
      return {};
    }
    const listeners = {};
    for (const statementType of FORBIDDEN_STATEMENTS) {
      listeners[statementType] = (node) => {
        context.report({ node, messageId: 'inlineLogic', data: { statement: statementType } });
      };
    }
    return listeners;
  },
};
