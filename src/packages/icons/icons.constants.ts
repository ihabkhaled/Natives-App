import {
  alertCircleOutline,
  checkmarkCircleOutline,
  cloudOfflineOutline,
  ellipseOutline,
  eyeOffOutline,
  eyeOutline,
  fileTrayOutline,
  flaskOutline,
  homeOutline,
  informationCircleOutline,
  lockClosedOutline,
  logOutOutline,
  personCircleOutline,
  refreshOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  warningOutline,
} from 'ionicons/icons';

/** The approved icon set. Feature code never imports ionicons directly. */
export const APP_ICONS = {
  alert: alertCircleOutline,
  checkmark: checkmarkCircleOutline,
  dot: ellipseOutline,
  offline: cloudOfflineOutline,
  empty: fileTrayOutline,
  eye: eyeOutline,
  eyeOff: eyeOffOutline,
  flask: flaskOutline,
  home: homeOutline,
  information: informationCircleOutline,
  lock: lockClosedOutline,
  logOut: logOutOutline,
  person: personCircleOutline,
  refresh: refreshOutline,
  settings: settingsOutline,
  shield: shieldCheckmarkOutline,
  warning: warningOutline,
} as const;

export type AppIconName = keyof typeof APP_ICONS;

export type AppIcon = (typeof APP_ICONS)[AppIconName];
