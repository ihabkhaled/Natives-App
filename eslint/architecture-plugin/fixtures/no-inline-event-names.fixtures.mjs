export default {
  valid: [
    {
      filename: 'src/modules/demo/services/track-demo.service.ts',
      code: 'import { trackEvent } from "@/packages/analytics"; import { DEMO_EVENTS } from "../constants/demo.constants"; export function trackDemo(){ trackEvent(DEMO_EVENTS.opened); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/services/track-demo.service.ts',
      code: 'import { trackEvent } from "@/packages/analytics"; export function trackDemo(){ trackEvent("demo.opened"); }',
      errors: [{ messageId: 'inlineEventName' }],
    },
    {
      filename: 'src/modules/demo/hooks/use-demo-socket.hook.ts',
      code: 'export function useDemoSocket(socket){ socket.on("demo:update", () => undefined); return socket; }',
      errors: [{ messageId: 'inlineEventName' }],
    },
  ],
};
