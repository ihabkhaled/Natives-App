export default {
  valid: [
    {
      filename: 'src/packages/secure-storage/secure-storage.facade.ts',
      code: 'export function readMirror(key){ return globalThis.sessionStorage.getItem(key); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/services/save-demo.service.ts',
      code: 'export function saveDemo(value){ localStorage.setItem("demo", value); }',
      errors: [{ messageId: 'storageApi' }],
    },
  ],
};
