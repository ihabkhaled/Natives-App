const serviceFile = 'src/modules/demo/services/load-demo.service.ts';

export default {
  valid: [
    {
      filename: serviceFile,
      code: 'function mapInternal(x){ return x; } export async function loadDemo(){ return mapInternal(1); }',
    },
  ],
  invalid: [
    {
      filename: serviceFile,
      code: 'export async function loadDemo(){ return 1; } export async function saveDemo(){ return 2; }',
      errors: [{ messageId: 'extraUseCase' }],
    },
  ],
};
