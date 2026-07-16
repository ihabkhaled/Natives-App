export default {
  valid: [
    {
      filename: 'src/packages/date/date.facade.ts',
      code: 'import dayjs from "dayjs"; export function formatIt(iso){ return dayjs(iso).format(); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/helpers/demo-date.helper.ts',
      code: 'import dayjs from "dayjs"; export function formatIt(iso){ return dayjs(iso).format(); }',
      errors: [{ messageId: 'outsideOwner' }],
    },
  ],
};
