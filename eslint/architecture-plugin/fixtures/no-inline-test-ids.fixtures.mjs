export default {
  valid: [
    {
      filename: 'src/shared/ui/badge/badge.component.tsx',
      code: 'import { BADGE_TEST_ID } from "./badge.constants"; export function Badge(){ return <span data-testid={BADGE_TEST_ID} />; }',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/ui/badge/badge.component.tsx',
      code: 'export function Badge(){ return <span data-testid="badge" />; }',
      errors: [{ messageId: 'inlineTestId' }],
    },
  ],
};
