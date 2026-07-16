export default {
  valid: [
    {
      filename: 'src/modules/auth/services/login.service.ts',
      code: 'export async function loginUser(){ return null; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/ghost-module/services/load-ghost.service.ts',
      code: 'export async function loadGhost(){ return null; }',
      errors: [{ messageId: 'missingIndex' }],
    },
  ],
};
