import { createLayerImportBanRule } from '../shared/layer-import-ban-rule.factory.mjs';

export default createLayerImportBanRule({
  description: 'Shared code never knows feature modules.',
  fromLayers: ['shared'],
  bannedTargetLayers: ['modules'],
  messageId: 'featureInShared',
  message:
    'Shared code must not import feature modules. Move the shared piece down or the feature piece up.',
});
