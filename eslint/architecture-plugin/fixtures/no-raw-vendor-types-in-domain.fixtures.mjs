export default {
  valid: [
    {
      filename: 'src/modules/demo/repositories/token.repository.ts',
      code: 'import type { TokenStore } from "@/packages/http"; export function createRepo(): TokenStore { return null; }',
    },
    {
      filename: 'src/packages/http/interfaces/http.interfaces.ts',
      code: 'import type { AxiosAdapter } from "axios"; export interface Deps { readonly adapter?: AxiosAdapter }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/types/demo.types.ts',
      code: 'import type { AxiosResponse } from "axios"; export type DemoResponse = AxiosResponse;',
      errors: [{ messageId: 'vendorTypeInDomain' }],
    },
  ],
};
