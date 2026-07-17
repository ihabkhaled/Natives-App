import { createVendorOwnershipRule } from '../shared/ownership-rule.factory.mjs';

export default createVendorOwnershipRule({
  description: 'React Virtuoso is imported only by the virtual-list owner.',
  vendorFilter: (vendor) => vendor === 'react-virtuoso',
});
