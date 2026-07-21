export { subscribeToAppLifecycle, type AppLifecycleCallbacks } from './app-state/app-state.facade';
export {
  registerHardwareBackHandler,
  type HardwareBackHandlerOptions,
} from './back-button/back-button.facade';
export { openUrlInAppBrowser } from './browser/browser.facade';
export { copyTextToClipboard } from './clipboard/clipboard.facade';
export {
  startDeepLinkListener,
  type DeepLinkListenerOptions,
} from './deep-links/deep-link.listener';
export {
  parseDeepLink,
  type DeepLinkPolicy,
  type DeepLinkRejection,
} from './deep-links/deep-link.parser';
export { getDeviceInformation, type DeviceInformation } from './device/device.facade';
export { getApplicationOrigin } from './environment/application-origin.facade';
export { getExecutionContext, type ExecutionContext } from './environment/execution-context.facade';
export { openExternalUrl } from './external-navigation/external-navigation.facade';
export { reloadApplication } from './lifecycle/app-reload.facade';
export {
  applyDocumentLocale,
  applyDocumentTheme,
  applyDocumentTitle,
  focusElementById,
} from './lifecycle/document-chrome.facade';
export { applyNativeChrome } from './lifecycle/native-chrome.facade';
export { getPlatformLogger } from './logging/platform-logger.facade';
export { useNetworkStatus, type NetworkStatus } from './network/hooks/use-network-status.hook';
export {
  registerPwaServiceWorker,
  type ApplyPwaUpdate,
  type PwaServiceWorkerLifecycle,
  type PwaServiceWorkerOptions,
  type PwaUpdateApplyResult,
} from './pwa/service-worker.facade';
export {
  mapRawPermissionState,
  PERMISSION_STATUS,
  type PermissionStatus,
} from './permissions/permission-state.mapper';
export {
  getRuntimePlatform,
  isNativeRuntime,
  type RuntimePlatform,
} from './runtime/runtime.facade';
export { getSystemPrefersDark, subscribeToSystemTheme } from './runtime/system-theme.facade';
export {
  DEFAULT_EXTERNAL_URL_POLICY,
  isAllowedExternalUrl,
  parseUrlSafely,
  type ExternalUrlPolicy,
} from './security/url-policy.parser';
export { createPreferencesStorageAdapter } from './storage/preferences-storage.adapter';
