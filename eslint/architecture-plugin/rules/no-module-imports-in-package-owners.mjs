import { createLayerImportBanRule } from '../shared/layer-import-ban-rule.factory.mjs';

export default createLayerImportBanRule({
  description: 'Package owners never import feature modules, shared, platform, or app code.',
  fromLayers: ['packages'],
  bannedTargetLayers: ['modules', 'shared', 'platform', 'app'],
  messageId: 'appCodeInPackage',
  message:
    'Package owners wrap vendors only; importing "{{target}}" couples the owner to application code.',
});
