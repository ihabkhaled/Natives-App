import { createBusinessLogicBanRule } from '../shared/business-logic-ban-rule.factory.mjs';

export default createBusinessLogicBanRule({
  description: 'Shared code stays generic; feature behavior lives in modules.',
  layer: 'shared',
  messageId: 'businessLogicInShared',
  message:
    'A "{{kind}}" file in src/shared owns feature behavior. Move it into the owning module.',
});
