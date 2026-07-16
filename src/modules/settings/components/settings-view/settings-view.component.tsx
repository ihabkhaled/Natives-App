import {
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSegment,
  IonSegmentButton,
} from '@/packages/ionic';
import type { AppLocale, ThemeMode } from '@/shared/enums';

import { SETTINGS_VIEW_TEST_IDS } from './settings-view.constants';
import type { SettingsViewProps } from './settings-view.types';

export function SettingsView(props: SettingsViewProps): React.JSX.Element {
  return (
    <IonList inset>
      <IonListHeader>
        <IonLabel>{props.appearanceLabel}</IonLabel>
      </IonListHeader>
      <IonItem>
        <IonLabel>{props.themeLabel}</IonLabel>
        <IonSegment
          value={props.theme}
          data-testid={SETTINGS_VIEW_TEST_IDS.themeSegment}
          aria-label={props.themeLabel}
          onIonChange={(event) => props.onThemeChange(event.detail.value as ThemeMode)}
        >
          {props.themeChoices.map((choice) => (
            <IonSegmentButton key={choice.value} value={choice.value}>
              <IonLabel>{choice.label}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </IonItem>
      <IonItem>
        <IonLabel>{props.languageLabel}</IonLabel>
        <IonSegment
          value={props.locale}
          data-testid={SETTINGS_VIEW_TEST_IDS.localeSegment}
          aria-label={props.languageLabel}
          onIonChange={(event) => props.onLocaleChange(event.detail.value as AppLocale)}
        >
          {props.localeChoices.map((choice) => (
            <IonSegmentButton key={choice.value} value={choice.value}>
              <IonLabel>{choice.label}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </IonItem>
      <IonListHeader>
        <IonLabel>{props.connectivityLabel}</IonLabel>
      </IonListHeader>
      <IonItem>
        <IonLabel>{props.connectivityLabel}</IonLabel>
        <IonBadge
          color={props.isOnline ? 'success' : 'warning'}
          data-testid={SETTINGS_VIEW_TEST_IDS.networkStatus}
        >
          {props.networkStatusText}
        </IonBadge>
      </IonItem>
      <IonItem>
        <IonLabel>{props.apiModeLabel}</IonLabel>
        <IonNote data-testid={SETTINGS_VIEW_TEST_IDS.apiMode}>{props.apiModeText}</IonNote>
      </IonItem>
      <IonListHeader>
        <IonLabel>{props.runtimeLabel}</IonLabel>
      </IonListHeader>
      <IonItem>
        <IonLabel>{props.platformLabel}</IonLabel>
        <IonNote data-testid={SETTINGS_VIEW_TEST_IDS.runtimePlatform}>
          {props.platformText}
        </IonNote>
      </IonItem>
    </IonList>
  );
}
