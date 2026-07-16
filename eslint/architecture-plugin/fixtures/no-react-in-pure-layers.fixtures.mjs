export default {
  valid: [
    {
      filename: 'src/modules/demo/mappers/demo.mapper.ts',
      code: 'export function mapDemo(dto){ return { id: dto.id }; }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/mappers/demo.mapper.ts',
      code: 'import { useMemo } from "react"; export function mapDemo(dto){ return useMemo(() => dto, [dto]); }',
      errors: [{ messageId: 'reactForbidden' }],
    },
    {
      filename: 'src/shared/helpers/format.helper.ts',
      code: 'import type { ReactNode } from "react"; export function wrap(node: ReactNode){ return node; }',
      errors: [{ messageId: 'reactForbidden' }],
    },
  ],
};
