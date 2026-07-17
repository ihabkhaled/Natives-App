# 04 — Containers

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST keep `*.container.tsx` to one job: call the screen hook, hand its result to the component.
- MUST name the screen hook after the screen — `use-health-card.hook.ts` for
  `health-card.container.tsx` — so the pairing is obvious from the file tree.
- MUST let the container be the only place a module's UI meets another module's public surface, and
  MUST pass the result down as a prop or slot rather than letting the view import it.
- MUST expose containers (not components) from a module `index.ts` when another module needs the
  screen.
- MUST keep the container's body to spreading the view model and rendering: `<View {...view} />`.

## Forbidden

- NEVER call `useState`, `useEffect`, `useMemo`, or any other built-in hook in a container; the
  screen hook owns all of it.
- NEVER fetch, map, translate, or format inside a container.
- NEVER declare a module-scope literal or a supporting type in a container file.
- NEVER let a container grow a second component; a second view needs its own folder.

## Rationale

The container is the seam where composition happens, and seams stay reviewable only if they stay
thin. With one hook and one component the container has no branches worth testing, so its cost is a
line of code rather than a test suite. It is also the only layer allowed to know that the home
screen embeds the health card, which keeps the two modules independent of each other's views.

## Valid

```tsx
// src/modules/health/containers/health-card.container.tsx
import { HealthStatusCard } from '../components/health-status-card';
import { useHealthCard } from '../hooks/use-health-card.hook';

export function HealthCardContainer(): React.JSX.Element {
  const view = useHealthCard();
  return <HealthStatusCard {...view} />;
}
```

## Invalid

```tsx
// src/modules/health/containers/health-card.container.tsx
const REFRESH_MS = 30_000; // module-scope literal belongs in a constants file

export function HealthCardContainer(): React.JSX.Element {
  const [open, setOpen] = useState(false); // built-in hook outside a hook file
  const view = useHealthCard();
  return <HealthStatusCard {...view} isOpen={open} onToggle={() => setOpen(!open)} />;
}
```

## Enforcement

| Mechanism                                                 | Command        |
| --------------------------------------------------------- | -------------- |
| `architecture/no-built-in-hooks-outside-hook-files`       | `npm run lint` |
| `architecture/no-third-party-hooks-outside-hook-files`    | `npm run lint` |
| `architecture/one-component-per-file`                     | `npm run lint` |
| `architecture/no-module-constants-outside-constant-files` | `npm run lint` |
| `architecture/no-types-outside-type-files`                | `npm run lint` |

Manual review where mechanical enforcement is impossible: a container that calls two or three screen
hooks and merges their results is still legal to the linter, but it has quietly become a hook. Ask
for one composed hook instead.

## Definition of done

- [ ] The container calls exactly one hook and renders exactly one component.
- [ ] Cross-module composition enters here and leaves as a prop or slot.
- [ ] No constants, types, or effects live in the container file.

## Related

[03-components](03-components.md) · [05-hooks-and-effects](05-hooks-and-effects.md) ·
[02-feature-modules](02-feature-modules.md) ·
[../src/modules/home/README.md](../src/modules/home/README.md)
