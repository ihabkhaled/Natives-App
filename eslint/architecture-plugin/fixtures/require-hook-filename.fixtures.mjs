export default {
  valid: [
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'export function useDemo(){ return 1; }',
    },
    {
      filename: 'src/modules/demo/store/demo.store.ts',
      code: 'export function useDemoStore(){ return 1; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/helpers/demo.helper.ts',
      code: 'export function useDemo(){ return 1; }',
      errors: [{ messageId: 'hookOutsideHookFile' }],
    },
  ],
};
