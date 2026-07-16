const componentFile = 'src/modules/demo/components/user-card/user-card.component.tsx';

export default {
  valid: [
    {
      filename: componentFile,
      code: 'export function UserCard(props){ return <div>{props.name}</div>; }',
    },
    {
      filename: 'src/modules/demo/hooks/use-user-card.hook.ts',
      code: 'import { useState } from "react"; export function useUserCard(){ return useState(0); }',
    },
  ],
  invalid: [
    {
      filename: componentFile,
      code: 'import { useState } from "react"; export function UserCard(){ const [n] = useState(0); return <div>{n}</div>; }',
      errors: [{ messageId: 'hookInComponent' }],
    },
    {
      filename: componentFile,
      code: 'import { useUserCard } from "../../hooks/use-user-card.hook"; export function UserCard(){ const view = useUserCard(); return <div>{view.name}</div>; }',
      errors: [{ messageId: 'hookInComponent' }],
    },
  ],
};
