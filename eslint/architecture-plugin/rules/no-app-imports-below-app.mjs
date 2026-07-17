import { createLayerImportBanRule } from '../shared/layer-import-ban-rule.factory.mjs';

export default createLayerImportBanRule({
  description: 'Only the app layer may import app composition code.',
  fromLayers: ['modules', 'platform', 'shared', 'packages'],
  bannedTargetLayers: ['app'],
  messageId: 'appImportBelowApp',
  message: 'Importing from src/app below the app layer inverts the dependency direction.',
});
