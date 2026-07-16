import { getFileKind } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource, isTestFile } from '../shared/rule-helpers.mjs';

const EVENT_CALLEES = new Set(['trackEvent', 'trackScreenView', 'emit', 'on']);

export default {
  meta: createRuleMeta({
    description: 'Analytics and realtime event names come from constants, never inline strings.',
    messages: {
      inlineEventName:
        'Raw event name passed to "{{callee}}". Move it to a *.constants.ts file.',
    },
  }),
  create(context) {
    const filename = context.filename;
    if (!isApplicationSource(filename) || isTestFile(filename)) {
      return {};
    }
    if (getFileKind(filename) === 'constants') {
      return {};
    }
    return {
      CallExpression(node) {
        const callee = node.callee;
        const calleeName =
          callee.type === 'Identifier'
            ? callee.name
            : callee.type === 'MemberExpression' && callee.property.type === 'Identifier'
              ? callee.property.name
              : null;
        if (calleeName === null || !EVENT_CALLEES.has(calleeName)) {
          return;
        }
        const firstArg = node.arguments[0];
        if (firstArg !== undefined && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          context.report({
            node: firstArg,
            messageId: 'inlineEventName',
            data: { callee: calleeName },
          });
        }
      },
    };
  },
};
