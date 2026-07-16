export default {
  valid: [
    {
      filename: 'src/shared/ui/badge/badge.component.tsx',
      code: 'export function Badge(props){ return <span>{props.label}</span>; }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/ui/badge/badge.component.tsx',
      code: 'export function Badge(){ return <span>Save changes</span>; }',
      errors: [{ messageId: 'rawText' }],
    },
    {
      filename: 'src/modules/demo/containers/demo.container.tsx',
      code: 'export function DemoContainer(){ return <div>{"Welcome back"}</div>; }',
      errors: [{ messageId: 'rawText' }],
    },
  ],
};
