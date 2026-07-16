import { createVendorOwnershipRule } from '../shared/ownership-rule.factory.mjs';

export default createVendorOwnershipRule({
  description: 'Capacitor plugins are imported only by their dedicated owner packages.',
  vendorFilter: (vendor) =>
    vendor.startsWith('@capacitor/') || vendor === '@aparajita/capacitor-secure-storage',
});
