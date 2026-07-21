import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { RecordList, SectionPanel, SelectField, WorkspaceScreen } from '@/shared/ui';

import { SettingVersionForm } from '../setting-version-form';
import { SETTINGS_STATE_TEST_IDS } from './admin-settings-view.constants';
import type { AdminSettingsViewProps } from './admin-settings-view.types';

/** Effective configuration, its versions, and the team's reference data. */
export function AdminSettingsView(props: AdminSettingsViewProps): React.JSX.Element {
  return (
    <WorkspaceScreen
      title={props.title}
      subtitle={props.subtitle}
      pageTestId={TEST_IDS.adminSettingsPage}
      viewTestId={TEST_IDS.adminSettingsView}
      className="app-admin-settings"
      notice={props.readOnlyNotice}
      state={{ view: props, variant: 'list', ...SETTINGS_STATE_TEST_IDS }}
    >
      <SectionPanel
        heading={props.effectiveHeading}
        intro={props.effectiveIntro}
        testId={TEST_IDS.adminEffectivePanel}
      >
        <IonNote>{props.asOfLabel}</IonNote>
        <RecordList
          rows={props.effectiveRows}
          ariaLabel={props.effectiveHeading}
          rowTestId={TEST_IDS.adminEffectiveRow}
        />
      </SectionPanel>

      <SectionPanel
        heading={props.versionsHeading}
        intro={props.versionsIntro}
        testId={TEST_IDS.adminVersionsPanel}
      >
        <SelectField
          label={props.settingKeyLabel}
          value={props.settingKey}
          options={props.settingKeyOptions}
          onChange={props.onSettingKeyChange}
          testId={TEST_IDS.adminSettingKeySelect}
        />
        <RecordList
          rows={props.versionRows}
          ariaLabel={props.versionsHeading}
          rowTestId={TEST_IDS.adminVersionRow}
        />
      </SectionPanel>

      {props.versionForm === null ? null : <SettingVersionForm {...props.versionForm} />}

      <SectionPanel
        heading={props.seasonsHeading}
        intro={props.seasonsIntro}
        testId={TEST_IDS.adminSeasonsPanel}
      >
        <RecordList
          rows={props.seasonRows}
          ariaLabel={props.seasonsHeading}
          rowTestId={TEST_IDS.adminSeasonRow}
        />
      </SectionPanel>

      <SectionPanel
        heading={props.venuesHeading}
        intro={props.venuesIntro}
        testId={TEST_IDS.adminVenuesPanel}
      >
        <RecordList
          rows={props.venueRows}
          ariaLabel={props.venuesHeading}
          rowTestId={TEST_IDS.adminVenueRow}
        />
      </SectionPanel>

      <SectionPanel
        heading={props.catalogHeading}
        intro={props.catalogIntro}
        testId={TEST_IDS.adminCatalogPanel}
      >
        <SelectField
          label={props.catalogLabel}
          value={props.catalog}
          options={props.catalogOptions}
          onChange={props.onCatalogChange}
          testId={TEST_IDS.adminCatalogSelect}
        />
        <RecordList
          rows={props.catalogRows}
          ariaLabel={props.catalogHeading}
          rowTestId={TEST_IDS.adminCatalogRow}
        />
      </SectionPanel>
    </WorkspaceScreen>
  );
}
