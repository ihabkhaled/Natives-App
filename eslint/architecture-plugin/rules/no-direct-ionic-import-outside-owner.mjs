import { createVendorOwnershipRule } from '../shared/ownership-rule.factory.mjs';

export default createVendorOwnershipRule({
  description: 'Ionic packages are imported only by the Ionic and router owners.',
  vendorFilter: (vendor) => vendor === '@ionic/react' || vendor === '@ionic/react-router',
});
