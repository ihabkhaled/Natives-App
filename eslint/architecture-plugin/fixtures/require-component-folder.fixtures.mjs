export default {
  valid: [
    {
      filename: 'src/shared/ui/badge/badge.component.tsx',
      code: 'export function Badge(props){ return <span>{props.label}</span>; }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/ui/badge.component.tsx',
      code: 'export function Badge(props){ return <span>{props.label}</span>; }',
      errors: [{ messageId: 'folderMismatch' }],
    },
    {
      filename: 'src/modules/demo/components/misc/badge.component.tsx',
      code: 'export function Badge(props){ return <span>{props.label}</span>; }',
      errors: [{ messageId: 'folderMismatch' }],
    },
  ],
};
