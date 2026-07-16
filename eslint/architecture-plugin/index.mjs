import noAppImportsBelowApp from './rules/no-app-imports-below-app.mjs';
import noBuiltInHooksOutsideHookFiles from './rules/no-built-in-hooks-outside-hook-files.mjs';
import noCrossModuleDeepImports from './rules/no-cross-module-deep-imports.mjs';
import noDefaultExportInAppSource from './rules/no-default-export-in-app-source.mjs';
import noDirectAxiosImportOutsideOwner from './rules/no-direct-axios-import-outside-owner.mjs';
import noDirectBrowserApiOutsidePlatform from './rules/no-direct-browser-api-outside-platform.mjs';
import noDirectDayjsImportOutsideOwner from './rules/no-direct-dayjs-import-outside-owner.mjs';
import noDirectIonicImportOutsideOwner from './rules/no-direct-ionic-import-outside-owner.mjs';
import noDirectNavigationOutsideRouterOwner from './rules/no-direct-navigation-outside-router-owner.mjs';
import noDirectStorageApiOutsidePlatform from './rules/no-direct-storage-api-outside-platform.mjs';
import noDirectVirtuosoImportOutsideOwner from './rules/no-direct-virtuoso-import-outside-owner.mjs';
import noFeatureBusinessLogicInApp from './rules/no-feature-business-logic-in-app.mjs';
import noFeatureBusinessLogicInShared from './rules/no-feature-business-logic-in-shared.mjs';
import noFeatureImportsInShared from './rules/no-feature-imports-in-shared.mjs';
import noFloatingNativeListeners from './rules/no-floating-native-listeners.mjs';
import noHooksInComponents from './rules/no-hooks-in-components.mjs';
import noImportMetaEnvOutsideEnvironment from './rules/no-import-meta-env-outside-environment.mjs';
import noInlineApiEndpoints from './rules/no-inline-api-endpoints.mjs';
import noInlineComponentLogic from './rules/no-inline-component-logic.mjs';
import noInlineEventNames from './rules/no-inline-event-names.mjs';
import noInlineQueryKeys from './rules/no-inline-query-keys.mjs';
import noInlineRoutes from './rules/no-inline-routes.mjs';
import noInlineStorageKeys from './rules/no-inline-storage-keys.mjs';
import noInlineTestIds from './rules/no-inline-test-ids.mjs';
import noInterfacesOutsideInterfaceFiles from './rules/no-interfaces-outside-interface-files.mjs';
import noModuleConstantsOutsideConstantFiles from './rules/no-module-constants-outside-constant-files.mjs';
import noModuleImportsInPackageOwners from './rules/no-module-imports-in-package-owners.mjs';
import noProcessEnvOutsideTooling from './rules/no-process-env-outside-tooling.mjs';
import noRawCapacitorImports from './rules/no-raw-capacitor-imports.mjs';
import noRawI18nText from './rules/no-raw-i18n-text.mjs';
import noRawPackageImports from './rules/no-raw-package-imports.mjs';
import noRawVendorTypesInDomain from './rules/no-raw-vendor-types-in-domain.mjs';
import noReactInGateways from './rules/no-react-in-gateways.mjs';
import noReactInPureLayers from './rules/no-react-in-pure-layers.mjs';
import noReactInServices from './rules/no-react-in-services.mjs';
import noRestrictedLayerImports from './rules/no-restricted-layer-imports.mjs';
import noServerStateInClientStore from './rules/no-server-state-in-client-store.mjs';
import noThirdPartyHooksOutsideHookFiles from './rules/no-third-party-hooks-outside-hook-files.mjs';
import noTypescriptEnum from './rules/no-typescript-enum.mjs';
import noTypesOutsideTypeFiles from './rules/no-types-outside-type-files.mjs';
import noUndocumentedEslintDisable from './rules/no-undocumented-eslint-disable.mjs';
import noUnsafeErrorDisplay from './rules/no-unsafe-error-display.mjs';
import oneComponentPerFile from './rules/one-component-per-file.mjs';
import oneGatewayResponsibilityPerFile from './rules/one-gateway-responsibility-per-file.mjs';
import oneHookPerFile from './rules/one-hook-per-file.mjs';
import oneServiceUseCasePerFile from './rules/one-service-use-case-per-file.mjs';
import requireComponentFolder from './rules/require-component-folder.mjs';
import requireHookFilename from './rules/require-hook-filename.mjs';
import requireModulePublicSurface from './rules/require-module-public-surface.mjs';
import requireNativeListenerCleanup from './rules/require-native-listener-cleanup.mjs';

/** Local architecture plugin: 50 mechanically enforced boundary rules. */
export const architecturePlugin = {
  meta: {
    name: 'eslint-plugin-architecture',
    version: '1.0.0',
  },
  rules: {
    'no-hooks-in-components': noHooksInComponents,
    'no-built-in-hooks-outside-hook-files': noBuiltInHooksOutsideHookFiles,
    'no-third-party-hooks-outside-hook-files': noThirdPartyHooksOutsideHookFiles,
    'no-inline-component-logic': noInlineComponentLogic,
    'one-component-per-file': oneComponentPerFile,
    'one-hook-per-file': oneHookPerFile,
    'one-service-use-case-per-file': oneServiceUseCasePerFile,
    'one-gateway-responsibility-per-file': oneGatewayResponsibilityPerFile,
    'no-types-outside-type-files': noTypesOutsideTypeFiles,
    'no-interfaces-outside-interface-files': noInterfacesOutsideInterfaceFiles,
    'no-typescript-enum': noTypescriptEnum,
    'no-module-constants-outside-constant-files': noModuleConstantsOutsideConstantFiles,
    'no-inline-query-keys': noInlineQueryKeys,
    'no-inline-routes': noInlineRoutes,
    'no-inline-api-endpoints': noInlineApiEndpoints,
    'no-inline-storage-keys': noInlineStorageKeys,
    'no-inline-event-names': noInlineEventNames,
    'no-inline-test-ids': noInlineTestIds,
    'no-raw-i18n-text': noRawI18nText,
    'no-raw-package-imports': noRawPackageImports,
    'no-raw-capacitor-imports': noRawCapacitorImports,
    'no-cross-module-deep-imports': noCrossModuleDeepImports,
    'no-restricted-layer-imports': noRestrictedLayerImports,
    'no-react-in-pure-layers': noReactInPureLayers,
    'no-react-in-services': noReactInServices,
    'no-react-in-gateways': noReactInGateways,
    'no-direct-browser-api-outside-platform': noDirectBrowserApiOutsidePlatform,
    'no-direct-storage-api-outside-platform': noDirectStorageApiOutsidePlatform,
    'no-import-meta-env-outside-environment': noImportMetaEnvOutsideEnvironment,
    'no-process-env-outside-tooling': noProcessEnvOutsideTooling,
    'no-feature-imports-in-shared': noFeatureImportsInShared,
    'no-module-imports-in-package-owners': noModuleImportsInPackageOwners,
    'no-app-imports-below-app': noAppImportsBelowApp,
    'no-server-state-in-client-store': noServerStateInClientStore,
    'require-module-public-surface': requireModulePublicSurface,
    'require-component-folder': requireComponentFolder,
    'require-hook-filename': requireHookFilename,
    'require-native-listener-cleanup': requireNativeListenerCleanup,
    'no-floating-native-listeners': noFloatingNativeListeners,
    'no-undocumented-eslint-disable': noUndocumentedEslintDisable,
    'no-unsafe-error-display': noUnsafeErrorDisplay,
    'no-raw-vendor-types-in-domain': noRawVendorTypesInDomain,
    'no-default-export-in-app-source': noDefaultExportInAppSource,
    'no-feature-business-logic-in-app': noFeatureBusinessLogicInApp,
    'no-feature-business-logic-in-shared': noFeatureBusinessLogicInShared,
    'no-direct-navigation-outside-router-owner': noDirectNavigationOutsideRouterOwner,
    'no-direct-ionic-import-outside-owner': noDirectIonicImportOutsideOwner,
    'no-direct-axios-import-outside-owner': noDirectAxiosImportOutsideOwner,
    'no-direct-dayjs-import-outside-owner': noDirectDayjsImportOutsideOwner,
    'no-direct-virtuoso-import-outside-owner': noDirectVirtuosoImportOutsideOwner,
  },
};

export const ALL_ARCHITECTURE_RULE_NAMES = Object.keys(architecturePlugin.rules);
