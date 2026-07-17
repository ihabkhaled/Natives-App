const gatewayFile = 'src/modules/demo/gateways/demo.gateway.ts';

export default {
  valid: [
    {
      filename: gatewayFile,
      code: 'export function requestDemo(){ return fetchIt(); } export function requestDemoList(){ return fetchAll(); }',
    },
  ],
  invalid: [
    {
      filename: gatewayFile,
      code: 'export function loadDemo(){ return fetchIt(); }',
      errors: [{ messageId: 'nonRequestExport' }],
    },
    {
      filename: gatewayFile,
      code: 'export const DEMO_URL = buildUrl();',
      errors: [{ messageId: 'nonRequestExport' }],
    },
  ],
};
