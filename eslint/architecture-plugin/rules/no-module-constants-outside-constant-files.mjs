import { getFileKind, isComponentFamily } from '../shared/file-info.mjs';
import { createRuleMeta, isApplicationSource } from '../shared/rule-helpers.mjs';

const RESTRICTED_KINDS = new Set([
  'hook',
  'service',
  'gateway',
  'repository',
  'store',
  'query',
  'mutation',
]);

function isLiteralLike(node) {
  if (node === null) {
    return false;
  }
  if (node.type === 'Literal' || node.type === 'TemplateLiteral') {
    return true;
  }
  if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') {
    return isLiteralLike(node.expression);
  }
  if (node.type === 'ObjectExpression' || node.type === 'ArrayExpression') {
    return true;
  }
  return false;
}

export default {
  meta: createRuleMeta({
    description:
      'Module-scope literal configuration belongs in *.constants.ts (or enums/variants/keys/paths) files.',
    messages: {
      inlineConstant:
        'Module-scope constant "{{name}}" hides configuration inside a "{{kind}}" file. Move it to a companion *.constants.ts file.',
    },
  }),
  create(context) {
    const kind = getFileKind(context.filename);
    if (!isApplicationSource(context.filename)) {
      return {};
    }
    if (!RESTRICTED_KINDS.has(kind) && !isComponentFamily(kind)) {
      return {};
    }
    return {
      'Program > VariableDeclaration, Program > ExportNamedDeclaration > VariableDeclaration'(
        node,
      ) {
        if (node.kind !== 'const') {
          return;
        }
        for (const declarator of node.declarations) {
          if (declarator.id.type === 'Identifier' && isLiteralLike(declarator.init)) {
            context.report({
              node: declarator,
              messageId: 'inlineConstant',
              data: { name: declarator.id.name, kind },
            });
          }
        }
      },
    };
  },
};
