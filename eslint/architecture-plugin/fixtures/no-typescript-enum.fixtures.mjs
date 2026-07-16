export default {
  valid: [
    {
      filename: 'src/shared/enums/status.enums.ts',
      code: 'export const STATUS = { Active: "active" } as const; export type Status = (typeof STATUS)[keyof typeof STATUS];',
    },
  ],
  invalid: [
    {
      filename: 'src/shared/enums/status.enums.ts',
      code: 'export enum Status { Active = "active" }',
      errors: [{ messageId: 'enumForbidden' }],
    },
    {
      filename: 'src/modules/demo/types/demo.types.ts',
      code: 'const enum Mode { On }',
      errors: [{ messageId: 'enumForbidden' }],
    },
  ],
};
