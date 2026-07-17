import type { SettingsScreenView } from '../../hooks/use-settings-screen.hook';

export type SettingsViewProps = Omit<SettingsScreenView, 'title'>;
