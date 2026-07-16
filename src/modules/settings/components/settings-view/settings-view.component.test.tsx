import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { APP_LOCALE, THEME_MODE } from '@/shared/enums';

import { fireIonChange } from '../../../../../tests/setup/ionic-events.helper';
import { SettingsView } from './settings-view.component';
import { SETTINGS_VIEW_TEST_IDS } from './settings-view.constants';
import type { SettingsViewProps } from './settings-view.types';

function buildProps(overrides: Partial<SettingsViewProps> = {}): SettingsViewProps {
  return {
    appearanceLabel: 'Appearance',
    themeLabel: 'Theme',
    themeChoices: [
      { value: THEME_MODE.Light, label: 'Light' },
      { value: THEME_MODE.Dark, label: 'Dark' },
      { value: THEME_MODE.System, label: 'System' },
    ],
    theme: THEME_MODE.System,
    onThemeChange: vi.fn(),
    languageLabel: 'Language',
    localeChoices: [
      { value: APP_LOCALE.English, label: 'English' },
      { value: APP_LOCALE.Arabic, label: 'العربية' },
    ],
    locale: APP_LOCALE.English,
    onLocaleChange: vi.fn(),
    connectivityLabel: 'Connectivity',
    networkStatusText: 'Online',
    isOnline: true,
    apiModeLabel: 'API mode',
    apiModeText: 'Mock (MSW)',
    runtimeLabel: 'Runtime',
    platformLabel: 'Platform',
    platformText: 'web · Web',
    ...overrides,
  };
}

function renderSettings(props: SettingsViewProps = buildProps()): void {
  render(<SettingsView {...props} />);
}

function segmentButtonsOf(testId: string): readonly Element[] {
  return [...document.body.querySelectorAll(`[data-testid="${testId}"] ion-segment-button`)];
}

/**
 * Ionic's slot polyfill patches an <ion-label>'s own childNodes away in
 * jsdom, so label copy is asserted through its host element instead.
 */
function headerTexts(): readonly (string | null)[] {
  return [...document.body.querySelectorAll('ion-list-header')].map((header) => header.textContent);
}

function itemLabelTexts(): readonly (string | null)[] {
  return [...document.body.querySelectorAll('ion-item')].map((item) => item.textContent);
}

describe('SettingsView', () => {
  it('renders a header per settings section', () => {
    renderSettings();

    expect(headerTexts()).toEqual(['Appearance', 'Connectivity', 'Runtime']);
  });

  it('labels every row', () => {
    renderSettings();

    expect(itemLabelTexts()).toEqual([
      'ThemeLightDarkSystem',
      'LanguageEnglishالعربية',
      'ConnectivityOnline',
      'API modeMock (MSW)',
      'Platformweb · Web',
    ]);
  });

  it('renders one theme segment button per choice', () => {
    renderSettings();

    const segment = screen.getByTestId(SETTINGS_VIEW_TEST_IDS.themeSegment);
    expect(segmentButtonsOf(SETTINGS_VIEW_TEST_IDS.themeSegment)).toHaveLength(3);
    expect(segment).toHaveTextContent('Light');
    expect(segment).toHaveTextContent('Dark');
    expect(segment).toHaveTextContent('System');
  });

  it('renders one locale segment button per choice', () => {
    renderSettings();

    const segment = screen.getByTestId(SETTINGS_VIEW_TEST_IDS.localeSegment);
    expect(segmentButtonsOf(SETTINGS_VIEW_TEST_IDS.localeSegment)).toHaveLength(2);
    expect(segment).toHaveTextContent('English');
    expect(segment).toHaveTextContent('العربية');
  });

  it('selects the active theme and locale', () => {
    renderSettings(buildProps({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic }));

    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.themeSegment)).toHaveProperty(
      'value',
      THEME_MODE.Dark,
    );
    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.localeSegment)).toHaveProperty(
      'value',
      APP_LOCALE.Arabic,
    );
  });

  it('labels both segments for assistive technology', () => {
    renderSettings();

    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.themeSegment)).toHaveAttribute(
      'aria-label',
      'Theme',
    );
    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.localeSegment)).toHaveAttribute(
      'aria-label',
      'Language',
    );
  });

  it('reports the picked theme back to the caller', () => {
    const props = buildProps();
    renderSettings(props);

    fireIonChange(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.themeSegment), THEME_MODE.Dark);

    expect(props.onThemeChange).toHaveBeenCalledExactlyOnceWith(THEME_MODE.Dark);
  });

  it('reports the picked locale back to the caller', () => {
    const props = buildProps();
    renderSettings(props);

    fireIonChange(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.localeSegment), APP_LOCALE.Arabic);

    expect(props.onLocaleChange).toHaveBeenCalledExactlyOnceWith(APP_LOCALE.Arabic);
  });

  it('badges an online connection in the success tone', () => {
    renderSettings();

    const badge = screen.getByTestId(SETTINGS_VIEW_TEST_IDS.networkStatus);
    expect(badge).toHaveTextContent('Online');
    expect(badge).toHaveAttribute('color', 'success');
  });

  it('badges a lost connection in the warning tone', () => {
    renderSettings(buildProps({ isOnline: false, networkStatusText: 'Offline' }));

    const badge = screen.getByTestId(SETTINGS_VIEW_TEST_IDS.networkStatus);
    expect(badge).toHaveTextContent('Offline');
    expect(badge).toHaveAttribute('color', 'warning');
  });

  it('notes the API mode', () => {
    renderSettings();

    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.apiMode)).toHaveTextContent('Mock (MSW)');
  });

  it('notes the runtime platform', () => {
    renderSettings();

    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.runtimePlatform)).toHaveTextContent(
      'web · Web',
    );
  });

  it('renders an empty platform note while the device lookup is pending', () => {
    renderSettings(buildProps({ platformText: '' }));

    expect(screen.getByTestId(SETTINGS_VIEW_TEST_IDS.runtimePlatform)).toBeEmptyDOMElement();
  });
});
