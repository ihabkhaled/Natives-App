export default {
  valid: [
    {
      filename: 'src/modules/demo/queries/demo.keys.ts',
      code: 'export const demoKeys = { all: ["demo"], list: () => [...demoKeys.all, "list"] };',
    },
    {
      filename: 'src/modules/demo/queries/demo.query.ts',
      code: 'import { demoKeys } from "./demo.keys"; export function buildDemoQuery(){ return { queryKey: demoKeys.list() }; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/queries/demo.query.ts',
      code: 'export function buildDemoQuery(){ return { queryKey: ["demo", "list"] }; }',
      errors: [{ messageId: 'inlineQueryKey' }],
    },
  ],
};
