import { createBusinessLogicBanRule } from '../shared/business-logic-ban-rule.factory.mjs';

export default createBusinessLogicBanRule({
  description: 'The app layer composes features; it never owns business logic.',
  layer: 'app',
  messageId: 'businessLogicInApp',
  message: 'A "{{kind}}" file in src/app owns feature behavior. Move it into the owning module.',
});
