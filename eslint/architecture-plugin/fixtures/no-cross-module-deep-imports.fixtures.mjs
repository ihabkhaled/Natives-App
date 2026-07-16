export default {
  valid: [
    {
      filename: 'src/modules/home/containers/home.container.tsx',
      code: 'import { HealthCard } from "@/modules/health"; export function HomeContainer(){ return <HealthCard />; }',
    },
    {
      filename: 'src/modules/health/containers/health.container.tsx',
      code: 'import { useHealth } from "../hooks/use-health.hook"; export function HealthContainer(){ const h = useHealth(); return <div>{h.status}</div>; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/home/containers/home.container.tsx',
      code: 'import { useHealth } from "@/modules/health/hooks/use-health.hook"; export function HomeContainer(){ const h = useHealth(); return <div>{h.status}</div>; }',
      errors: [{ messageId: 'deepImport' }],
    },
  ],
};
