/**
 * Single canonical source for application identity.
 * capacitor.config.ts, native project generation, and the environment
 * schema all derive identity from here. See docs/setup/project-customization.md
 * for every place that must change when rebranding.
 */
export const APP_IDENTITY = {
  appId: 'com.capacitorranger.app',
  appName: 'Capacitor Ranger',
  appSlug: 'capacitor-ranger',
  packageScope: '@app',
} as const;
