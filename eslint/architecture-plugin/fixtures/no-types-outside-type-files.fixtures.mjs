export default {
  valid: [
    {
      filename: 'src/shared/ui/badge/badge.types.ts',
      code: 'export type BadgeTone = "info" | "danger";',
    },
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'export type DemoView = { readonly label: string }; export function useDemo(){ return { label: "" }; }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/ui/badge/badge.component.tsx',
      code: 'type BadgeTone = "info" | "danger"; export function Badge(props){ return <span>{props.label}</span>; }',
      errors: [{ messageId: 'inlineType' }],
    },
  ],
};
