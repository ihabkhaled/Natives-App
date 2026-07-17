export default {
  valid: [
    {
      filename: 'src/platform/lifecycle/document-chrome.facade.ts',
      code: 'export function applyTheme(isDark){ document.documentElement.classList.toggle("dark", isDark); }',
    },
    {
      filename: 'src/modules/demo/helpers/demo.helper.ts',
      code: 'export function pickDocument(record){ return record.document; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'export function useDemo(){ return document.title; }',
      errors: [{ messageId: 'browserApi' }],
    },
    {
      filename: 'src/shared/helpers/theme.helper.ts',
      code: 'export function prefersDark(){ return globalThis.matchMedia("(prefers-color-scheme: dark)").matches; }',
      errors: [{ messageId: 'browserApi' }],
    },
  ],
};
