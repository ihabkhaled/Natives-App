import {
  alertCircleOutline,
  calendarOutline,
  checkmarkCircleOutline,
  cloudOfflineOutline,
  ellipseOutline,
  eyeOffOutline,
  eyeOutline,
  fileTrayOutline,
  flaskOutline,
  homeOutline,
  informationCircleOutline,
  locationOutline,
  lockClosedOutline,
  logOutOutline,
  peopleOutline,
  personCircleOutline,
  refreshOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  timeOutline,
  warningOutline,
} from 'ionicons/icons';

/** The approved icon set. Feature code never imports ionicons directly. */
export const APP_ICONS = {
  alert: alertCircleOutline,
  calendar: calendarOutline,
  checkmark: checkmarkCircleOutline,
  dot: ellipseOutline,
  offline: cloudOfflineOutline,
  empty: fileTrayOutline,
  eye: eyeOutline,
  eyeOff: eyeOffOutline,
  flask: flaskOutline,
  home: homeOutline,
  information: informationCircleOutline,
  location: locationOutline,
  lock: lockClosedOutline,
  logOut: logOutOutline,
  people: peopleOutline,
  person: personCircleOutline,
  refresh: refreshOutline,
  settings: settingsOutline,
  shield: shieldCheckmarkOutline,
  time: timeOutline,
  warning: warningOutline,
} as const;

export type AppIconName = keyof typeof APP_ICONS;

export type AppIcon = (typeof APP_ICONS)[AppIconName];
