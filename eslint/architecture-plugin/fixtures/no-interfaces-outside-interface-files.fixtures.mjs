export default {
  valid: [
    {
      filename: 'src/shared/ui/badge/badge.types.ts',
      code: 'export interface BadgeProps { readonly label: string }',
    },
    {
      filename: 'src/modules/demo/hooks/use-demo.hook.ts',
      code: 'export interface DemoView { readonly label: string } export function useDemo(){ return { label: "" }; }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/ui/badge/badge.component.tsx',
      code: 'interface BadgeProps { readonly label: string } export function Badge(props: BadgeProps){ return <span>{props.label}</span>; }',
      errors: [{ messageId: 'inlineInterface' }],
    },
    {
      filename: 'src/modules/demo/containers/demo.container.tsx',
      code: 'export interface DemoContainerProps { readonly id: string } export function DemoContainer(props: DemoContainerProps){ return <div>{props.id}</div>; }',
      errors: [{ messageId: 'inlineInterface' }],
    },
  ],
};
