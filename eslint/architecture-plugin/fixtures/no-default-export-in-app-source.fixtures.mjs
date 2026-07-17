export default {
  valid: [
    {
      filename: 'src/modules/demo/helpers/demo.helper.ts',
      code: 'export function formatDemo(){ return "x"; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/helpers/demo.helper.ts',
      code: 'export default function formatDemo(){ return "x"; }',
      errors: [{ messageId: 'defaultExport' }],
    },
  ],
};
