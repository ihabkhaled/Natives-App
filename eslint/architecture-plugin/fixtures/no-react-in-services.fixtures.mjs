export default {
  valid: [
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'export async function loadDemo(){ return { id: 1 }; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'import { useState } from "react"; export async function loadDemo(){ return useState; }',
      errors: [{ messageId: 'reactForbidden' }],
    },
  ],
};
