const componentFile = 'src/shared/ui/badge/badge.component.tsx';

export default {
  valid: [
    {
      filename: componentFile,
      code: 'export function Badge(props){ return props.visible ? <span>{props.label}</span> : null; }',
    },
  ],
  invalid: [
    {
      filename: componentFile,
      code: 'export function Badge(props){ if (props.visible) { return <span>{props.label}</span>; } return null; }',
      errors: [{ messageId: 'inlineLogic' }],
    },
    {
      filename: componentFile,
      code: 'export function Badge(props){ for (const item of props.items) { void item; } return <span />; }',
      errors: [{ messageId: 'inlineLogic' }],
    },
  ],
};
