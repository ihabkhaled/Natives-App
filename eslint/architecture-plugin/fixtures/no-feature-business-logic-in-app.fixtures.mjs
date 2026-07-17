export default {
  valid: [
    {
      filename: 'src/app/startup/i18n-resources.helper.ts',
      code: 'export function buildResources(){ return {}; }',
    },
  ],
  invalid: [
    {
      filename: 'src/app/services/load-user.service.ts',
      code: 'export async function loadUser(){ return null; }',
      errors: [{ messageId: 'businessLogicInApp' }],
    },
  ],
};
