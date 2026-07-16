import { createVendorOwnershipRule } from '../shared/ownership-rule.factory.mjs';

export default createVendorOwnershipRule({
  description: 'Axios is imported only by the HTTP owner.',
  vendorFilter: (vendor) => vendor === 'axios',
});
