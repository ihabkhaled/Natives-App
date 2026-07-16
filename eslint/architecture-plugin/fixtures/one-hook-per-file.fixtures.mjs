const hookFile = 'src/modules/demo/hooks/use-demo.hook.ts';

export default {
  valid: [
    {
      filename: hookFile,
      code: 'export function useDemo(){ return 1; }',
    },
  ],
  invalid: [
    {
      filename: hookFile,
      code: 'export function useDemo(){ return 1; } export function useOther(){ return 2; }',
      errors: [{ messageId: 'extraHook' }],
    },
    {
      filename: hookFile,
      code: 'export function useDemo(){ return 1; } export function formatDemo(){ return "x"; }',
      errors: [{ messageId: 'nonHookExport' }],
    },
  ],
};
