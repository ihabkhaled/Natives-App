export default {
  valid: [
    {
      filename: 'src/modules/demo/components/demo-view/demo-view.component.tsx',
      code: 'export function DemoView(props){ return <span>{props.errorMessage}</span>; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/components/demo-view/demo-view.component.tsx',
      code: 'export function DemoView(props){ return <span>{props.error.message}</span>; }',
      errors: [{ messageId: 'unsafeErrorDisplay' }],
    },
    {
      filename: 'src/modules/demo/containers/demo.container.tsx',
      code: 'export function DemoContainer({ error }){ return <div>{error}</div>; }',
      errors: [{ messageId: 'unsafeErrorDisplay' }],
    },
  ],
};
