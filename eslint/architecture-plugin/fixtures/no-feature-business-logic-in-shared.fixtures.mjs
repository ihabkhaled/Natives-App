export default {
  valid: [
    {
      filename: 'src/shared/helpers/format.helper.ts',
      code: 'export function formatIt(value){ return String(value); }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/gateways/user.gateway.ts',
      code: 'export function requestUser(){ return null; }',
      errors: [{ messageId: 'businessLogicInShared' }],
    },
  ],
};
