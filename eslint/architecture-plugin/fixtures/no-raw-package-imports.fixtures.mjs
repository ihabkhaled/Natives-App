export default {
  valid: [
    {
      filename: 'src/packages/http/http-client.factory.ts',
      code: 'import axios from "axios"; export function build(){ return axios.create(); }',
    },
    {
      filename: 'src/modules/demo/gateways/demo.gateway.ts',
      code: 'import { getAppHttpClient } from "@/packages/http"; export function requestDemo(schema){ return getAppHttpClient().get(schema.path, schema); }',
    },
    {
      filename: 'src/modules/demo/components/demo-view/demo-view.component.tsx',
      code: 'import { useState } from "react"; export function noop(){}',
    },
  ],
  invalid: [
    {
      filename: 'src/modules/demo/gateways/demo.gateway.ts',
      code: 'import axios from "axios"; export function requestDemo(){ return axios.get("x"); }',
      errors: [{ messageId: 'outsideOwner' }],
    },
    {
      filename: 'src/modules/demo/helpers/demo.helper.ts',
      code: 'import lodash from "lodash"; export function pickIt(v){ return lodash.pick(v, []); }',
      errors: [{ messageId: 'unregisteredVendor' }],
    },
  ],
};
