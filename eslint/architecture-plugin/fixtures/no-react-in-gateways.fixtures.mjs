export default {
  valid: [
    {
      filename: 'src/modules/demo/gateways/demo.gateway.ts',
      code: 'export function requestDemo(client, schema){ return client.get(schema.path, schema); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/gateways/demo.gateway.ts',
      code: 'import { useEffect } from "react"; export function requestDemo(){ return useEffect; }',
      errors: [{ messageId: 'reactForbidden' }],
    },
    {
      filename: 'src/modules/demo/repositories/demo.repository.ts',
      code: 'import { useRef } from "react"; export function createDemoRepository(){ return useRef; }',
      errors: [{ messageId: 'reactForbidden' }],
    },
  ],
};
