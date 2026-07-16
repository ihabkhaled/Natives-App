/**
 * Machine-readable vendor ownership registry.
 * Consumed by the architecture plugin (no-raw-package-imports and friends),
 * scripts/architecture/validate-package-ownership.mjs, and documentation.
 *
 * Every third-party runtime dependency must appear here with exactly one
 * owning directory (a few infrastructure vendors allow a short list).
 */
export const FOUNDATIONAL_VENDORS = ['react', 'react-dom'];

export const PACKAGE_OWNERSHIP = [
  { vendor: '@ionic/react', owner: '@/packages/ionic', ownerDirs: ['src/packages/ionic', 'src/packages/router'] },
  { vendor: '@ionic/react-router', owner: '@/packages/router', ownerDirs: ['src/packages/router'] },
  { vendor: 'react-router', owner: '@/packages/router', ownerDirs: ['src/packages/router'] },
  { vendor: 'react-router-dom', owner: '@/packages/router', ownerDirs: ['src/packages/router'] },
  { vendor: 'ionicons', owner: '@/packages/icons', ownerDirs: ['src/packages/icons'] },
  { vendor: 'axios', owner: '@/packages/http', ownerDirs: ['src/packages/http'] },
  { vendor: '@tanstack/react-query', owner: '@/packages/query', ownerDirs: ['src/packages/query'] },
  { vendor: '@tanstack/react-query-devtools', owner: '@/packages/query', ownerDirs: ['src/packages/query'] },
  { vendor: 'zustand', owner: '@/packages/state', ownerDirs: ['src/packages/state'] },
  { vendor: 'zod', owner: '@/packages/schema', ownerDirs: ['src/packages/schema'] },
  { vendor: 'react-hook-form', owner: '@/packages/forms', ownerDirs: ['src/packages/forms'] },
  { vendor: '@hookform/resolvers', owner: '@/packages/forms', ownerDirs: ['src/packages/forms'] },
  { vendor: 'dayjs', owner: '@/packages/date', ownerDirs: ['src/packages/date'] },
  { vendor: 'react-virtuoso', owner: '@/packages/virtual-list', ownerDirs: ['src/packages/virtual-list'] },
  { vendor: 'i18next', owner: '@/packages/i18n', ownerDirs: ['src/packages/i18n'] },
  { vendor: 'react-i18next', owner: '@/packages/i18n', ownerDirs: ['src/packages/i18n'] },
  { vendor: 'i18next-browser-languagedetector', owner: '@/packages/i18n', ownerDirs: ['src/packages/i18n'] },
  { vendor: 'class-variance-authority', owner: '@/packages/ui-classes', ownerDirs: ['src/packages/ui-classes'] },
  { vendor: 'clsx', owner: '@/packages/ui-classes', ownerDirs: ['src/packages/ui-classes'] },
  { vendor: 'tailwind-merge', owner: '@/packages/ui-classes', ownerDirs: ['src/packages/ui-classes'] },
  { vendor: 'socket.io-client', owner: '@/packages/realtime', ownerDirs: ['src/packages/realtime'] },
  { vendor: '@sentry/react', owner: '@/packages/error-reporting', ownerDirs: ['src/packages/error-reporting'] },
  { vendor: '@sentry/capacitor', owner: '@/packages/error-reporting', ownerDirs: ['src/packages/error-reporting'] },
  { vendor: '@aparajita/capacitor-secure-storage', owner: '@/packages/secure-storage', ownerDirs: ['src/packages/secure-storage'] },
  { vendor: '@capacitor/core', owner: '@/platform (runtime)', ownerDirs: ['src/platform/runtime', 'src/packages/secure-storage'] },
  { vendor: '@capacitor/app', owner: '@/packages/capacitor-app', ownerDirs: ['src/packages/capacitor-app'] },
  { vendor: '@capacitor/browser', owner: '@/packages/capacitor-browser', ownerDirs: ['src/packages/capacitor-browser'] },
  { vendor: '@capacitor/device', owner: '@/packages/capacitor-device', ownerDirs: ['src/packages/capacitor-device'] },
  { vendor: '@capacitor/haptics', owner: '@/packages/capacitor-haptics', ownerDirs: ['src/packages/capacitor-haptics'] },
  { vendor: '@capacitor/keyboard', owner: '@/packages/capacitor-keyboard', ownerDirs: ['src/packages/capacitor-keyboard'] },
  { vendor: '@capacitor/network', owner: '@/packages/capacitor-network', ownerDirs: ['src/packages/capacitor-network'] },
  { vendor: '@capacitor/preferences', owner: '@/packages/capacitor-preferences', ownerDirs: ['src/packages/capacitor-preferences'] },
  { vendor: '@capacitor/share', owner: '@/packages/capacitor-share', ownerDirs: ['src/packages/capacitor-share'] },
  { vendor: '@capacitor/splash-screen', owner: '@/packages/capacitor-splash-screen', ownerDirs: ['src/packages/capacitor-splash-screen'] },
  { vendor: '@capacitor/status-bar', owner: '@/packages/capacitor-status-bar', ownerDirs: ['src/packages/capacitor-status-bar'] },
  { vendor: 'msw', owner: 'src/tests/msw', ownerDirs: ['src/tests/msw'] },
];

export function findOwnershipEntry(packageName) {
  return PACKAGE_OWNERSHIP.find((entry) => entry.vendor === packageName) ?? null;
}
