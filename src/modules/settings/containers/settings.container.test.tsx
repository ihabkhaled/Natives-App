import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { APP_LOCALE, THEME_MODE } from '@/shared/enums';

import { fireIonChange } from '../../../../tests/setup/ionic-events.helper';
import { SETTINGS_VIEW_TEST_IDS } from '../components/settings-view/settings-view.constants';
import { useSettingsScreen, type SettingsScreenView } from '../hooks/use-settings-screen.hook';
import { SettingsContainer } from './settings.container';

vi.mock('../hooks/use-settings-screen.hook', () => ({ useSettingsScreen: vi.fn() }));

const onThemeChange = vi.fn();
const onLocaleChange = vi.fn();

function mockScreen(overrides: Partial<SettingsScreenView> = {}): void {
  vi.mocked(useSettingsScreen).mockReturnValue({
    title: 'Settings',
    appearanceLabel: 'Appearance',
    themeLabel: 'Theme',
    themeChoices: [
      { value: THEME_MODE.Light, label: 'Light' },
      { value: THEME_MODE.Dark, label: 'Dark' },
      { value: THEME_MODE.System, label: 'System' },
    ],
    theme: THEME_MODE.System,
    onThemeChange,
    languageLabel: 'Language',
    localeChoices: [
      { value: APP_LOCALE.English, label: 'English' },
      { value: APP_LOCALE.Arabic, label: 'العربية' },
    ],
    locale: APP_LOCALE.English,
    onLocaleChange,
    connectivityLabel: 'Connectivity',
    networkStatusText: 'Online',
    isOnline: true,
    apiModeLabel: 'API mode',
    apiModeText: 'Mock (MSW)',
    runtimeLabel: 'Runtime',
    platformLabel: 'Platform',
    platformText: 'web · Web',
    ...overrides,
  });
}

beforeEach(() => {
  mockScreen();
});

afterEach(() => {
  vi.clearAllMocks();
});

function getIonTitle(): Element | null {
  return document.body.querySelector('ion-title');
}

function getIonList(): Element | null {
  return document.body.querySelector('ion-list');
}

describe('SettingsContainer', () => {
  it('renders the settings page shell titled from the screen hook', () => {
    render(<SettingsContainer />);

    expect(screen.getByTestId(TEST_IDS.settingsPage)).toBeInTheDocument();
    expect(getIonTitle()).toHaveTextContent('Settings');
  });

  it('feeds the view model into the settings view', () => {
    render(<SettingsContainer />);

    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.themeSegment)).toHaveProperty(
      'value',
      THEME_MODE.System,
    );
    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.localeSegment)).toHaveProperty(
      'value',
      APP_LOCALE.English,
    );
    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.networkStatus)).toHaveTextContent('Online');
    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.apiMode)).toHaveTextContent('Mock (MSW)');
    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.runtimePlatform)).toHaveTextContent(
      'web · Web',
    );
  });

  it('keeps the page title out of the view, which renders its own sections', () => {
    render(<SettingsContainer />);

    expect(getIonList()).not.toHaveTextContent('Settings');
  });

  it('wires a theme change back to the screen hook', () => {
    render(<SettingsContainer />);

    fireIonChange(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.themeSegment), THEME_MODE.Dark);

    expect(onThemeChange).toHaveBeenCalledExactlyOnceWith(THEME_MODE.Dark);
  });

  it('wires a locale change back to the screen hook', () => {
    render(<SettingsContainer />);

    fireIonChange(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.localeSegment), APP_LOCALE.Arabic);

    expect(onLocaleChange).toHaveBeenCalledExactlyOnceWith(APP_LOCALE.Arabic);
  });
});
