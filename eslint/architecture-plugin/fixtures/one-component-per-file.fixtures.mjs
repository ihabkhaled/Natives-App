const componentFile = 'src/shared/ui/badge/badge.component.tsx';

export default {
  valid: [
    {
      filename: componentFile,
      code: 'export function Badge(props){ return <span>{props.label}</span>; }',
    },
    {
      filename: 'src/modules/demo/helpers/format.helper.ts',
      code: 'export function formatLabel(label){ return label.trim(); }',
    },
  ],
  invalid: [
    {
      filename: componentFile,
      code: 'export function Badge(props){ return <span>{props.label}</span>; } export function BadgeIcon(){ return <i />; }',
      errors: [{ messageId: 'extraComponent' }],
    },
    {
      filename: 'src/modules/demo/helpers/format-badge.helper.tsx',
      code: 'export function FormatBadge(){ return <span />; }',
      errors: [{ messageId: 'componentOutsideUiFile' }],
    },
  ],
};
