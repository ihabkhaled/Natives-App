# architecture/no-inline-event-names

**Severity:** error · **Scope:** `src/**` except tests and `*.constants.ts` files

## What it enforces

The first argument of `trackEvent`, `trackScreenView`, `emit`, or `on` MUST NEVER be a string
literal. Analytics and realtime event names always come from constants.

## Why

A constants file is the single inventory of event names, preventing typos and silent divergence
between emitters and listeners.

## Valid

```tsx
// src/modules/demo/services/track-demo.service.ts
import { trackEvent } from '@/packages/analytics';
import { DEMO_EVENTS } from '../constants/demo.constants';

export function trackDemo() {
  trackEvent(DEMO_EVENTS.opened);
}
```

## Invalid

```tsx
// src/modules/demo/services/track-demo.service.ts
import { trackEvent } from '@/packages/analytics';

export function trackDemo() {
  trackEvent('demo.opened');
}
```

## How to fix

Declare the event name in the module's `*.constants.ts` file and pass the constant to the
tracking or socket call.
