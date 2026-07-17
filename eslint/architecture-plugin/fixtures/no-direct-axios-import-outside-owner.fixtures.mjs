export default {
  valid: [
    {
      filename: 'src/packages/http/http-error.mapper.ts',
      code: 'import { isAxiosError } from "axios"; export function isIt(e){ return isAxiosError(e); }',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/services/load-demo.service.ts',
      code: 'import axios from "axios"; export async function loadDemo(){ return axios.get(target); }',
      errors: [{ messageId: 'outsideOwner' }],
    },
  ],
};
