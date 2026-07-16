export default {
  valid: [
    {
      filename: 'src/modules/demo/gateways/demo.gateway.ts',
      code: 'import { DEMO_API_PATHS } from "../constants/demo-api.constants"; export function requestDemo(client, schema){ return client.get(DEMO_API_PATHS.list, schema); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/gateways/demo.gateway.ts',
      code: 'export function requestDemo(client, schema){ return client.get("/demo", schema); }',
      errors: [{ messageId: 'inlineEndpoint' }],
    },
  ],
};
