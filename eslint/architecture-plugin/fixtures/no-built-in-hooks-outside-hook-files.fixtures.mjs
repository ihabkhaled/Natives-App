export default {
  valid: [
    {
      filename: 'src/modules/demo/hooks/use-counter.hook.ts',
      code: 'import { useState } from "react"; export function useCounter(){ return useState(0); }',
    },
    {
      filename: 'src/modules/demo/containers/demo.container.tsx',
      code: 'import { useCounter } from "../hooks/use-counter.hook"; export function DemoContainer(){ const c = useCounter(); return <div>{c}</div>; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/containers/demo.container.tsx',
      code: 'import { useState } from "react"; export function DemoContainer(){ const [n] = useState(0); return <div>{n}</div>; }',
      errors: [{ messageId: 'builtInHookOutsideHookFile' }],
    },
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'import { useMemo } from "react"; export function loadDemo(){ return useMemo(() => 1, []); }',
      errors: [{ messageId: 'builtInHookOutsideHookFile' }],
    },
  ],
};
