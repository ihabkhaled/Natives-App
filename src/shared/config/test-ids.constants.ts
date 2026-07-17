/**
 * Every data-testid in the application, in one place.
 * Raw test ids are forbidden everywhere else (ESLint:
 * architecture/no-inline-test-ids).
 */
export const TEST_IDS = {
  appShell: 'app-shell',
  offlineBanner: 'offline-banner',
  globalLoading: 'global-loading',
  errorBoundaryFallback: 'error-boundary-fallback',
  welcomePage: 'welcome-page',
  welcomeLoginCta: 'welcome-login-cta',
  loginPage: 'login-page',
  loginEmailInput: 'login-email-input',
  loginPasswordInput: 'login-password-input',
  loginSubmitButton: 'login-submit-button',
  loginErrorMessage: 'login-error-message',
  homePage: 'home-page',
  homeGreeting: 'home-greeting',
  homeLogoutButton: 'home-logout-button',
  healthCard: 'health-card',
  healthStatus: 'health-status',
  healthRefreshButton: 'health-refresh-button',
  settingsPage: 'settings-page',
  settingsThemeSelect: 'settings-theme-select',
  settingsLocaleSelect: 'settings-locale-select',
  settingsNetworkStatus: 'settings-network-status',
  settingsApiMode: 'settings-api-mode',
  settingsRuntimePlatform: 'settings-runtime-platform',
  workbenchPage: 'workbench-page',
  workbenchButtons: 'workbench-buttons',
  workbenchForm: 'workbench-form',
  workbenchFormName: 'workbench-form-name',
  workbenchFormEmail: 'workbench-form-email',
  workbenchFormSubmit: 'workbench-form-submit',
  workbenchFormResult: 'workbench-form-result',
  workbenchStates: 'workbench-states',
  workbenchVirtualList: 'workbench-virtual-list',
  virtualListItem: 'virtual-list-item',
  loadingState: 'loading-state',
  emptyState: 'empty-state',
  errorState: 'error-state',
  offlineState: 'offline-state',
  permissionState: 'permission-state',
  notFoundPage: 'not-found-page',
  notFoundHomeLink: 'not-found-home-link',
} as const;

export type TestId = (typeof TEST_IDS)[keyof typeof TEST_IDS];
