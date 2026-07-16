import { createVendorOwnershipRule } from '../shared/ownership-rule.factory.mjs';

export default createVendorOwnershipRule({
  description: 'Day.js is imported only by the date owner.',
  vendorFilter: (vendor) => vendor === 'dayjs',
});
