import {
  alertCircleOutline,
  checkmarkCircleOutline,
  cloudOfflineOutline,
  eyeOffOutline,
  eyeOutline,
  fileTrayOutline,
  flaskOutline,
  homeOutline,
  lockClosedOutline,
  logOutOutline,
  refreshOutline,
  settingsOutline,
  warningOutline,
} from 'ionicons/icons';

/** The approved icon set. Feature code never imports ionicons directly. */
export const APP_ICONS = {
  alert: alertCircleOutline,
  checkmark: checkmarkCircleOutline,
  offline: cloudOfflineOutline,
  empty: fileTrayOutline,
  eye: eyeOutline,
  eyeOff: eyeOffOutline,
  flask: flaskOutline,
  home: homeOutline,
  lock: lockClosedOutline,
  logOut: logOutOutline,
  refresh: refreshOutline,
  settings: settingsOutline,
  warning: warningOutline,
} as const;

export type AppIconName = keyof typeof APP_ICONS;

export type AppIcon = (typeof APP_ICONS)[AppIconName];
