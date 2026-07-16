import { createVendorOwnershipRule } from '../shared/ownership-rule.factory.mjs';

export default createVendorOwnershipRule({
  description:
    'Every third-party package is imported only by its registered owner; features use facades.',
  vendorFilter: () => true,
});
