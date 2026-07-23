import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppInput } from '@/shared/ui';

import { DEFAULT_BRANDING_ACCENT } from '../../../constants/setting-values.constants';
import { brandingFieldPatch } from '../../../helpers/setting-editor-form-values.helper';
import type { ReportBrandingEditorProps } from '../setting-editors.types';

/**
 * Report identity, seen rather than imagined: name, accent, footer, and
 * contact, mirrored live into a mini report-header preview card.
 */
export function ReportBrandingEditor(props: ReportBrandingEditorProps): React.JSX.Element {
  const labels = props.context.labels;
  const accent = props.value.accentColor ?? DEFAULT_BRANDING_ACCENT;
  const field = (
    name: 'displayName' | 'accentColor' | 'footerText' | 'contactEmail' | 'logoMediaKey',
    label: string,
    value: string,
  ): React.JSX.Element => (
    <AppInput
      label={label}
      name={`branding-${name}`}
      value={value}
      testId={`${TEST_IDS.adminSettingEditor}-${name}`}
      onValueChange={(raw) => {
        props.onChange(brandingFieldPatch(props.value, name, raw));
      }}
    />
  );
  return (
    <div className="app-editor-entry" data-testid={TEST_IDS.adminSettingEditor}>
      {field('displayName', labels.displayName, props.value.displayName)}
      <div className="app-editor-entry__row">
        <span className="app-color-swatch" style={{ backgroundColor: accent }} aria-hidden="true" />
        {field('accentColor', labels.accentColor, props.value.accentColor ?? '')}
      </div>
      {field('footerText', labels.footerText, props.value.footerText ?? '')}
      {field('contactEmail', labels.contactEmail, props.value.contactEmail ?? '')}
      {field('logoMediaKey', labels.logoKey, props.value.logoMediaKey ?? '')}
      <IonNote>{labels.previewHeading}</IonNote>
      <div
        className="app-surface-card app-branding-preview"
        data-testid={TEST_IDS.adminBrandingPreview}
      >
        <div
          className="app-branding-preview__bar"
          data-testid={TEST_IDS.adminBrandingPreviewBar}
          style={{ backgroundColor: accent }}
        />
        <p className="app-branding-preview__name m-0">{props.value.displayName}</p>
        <IonNote>{props.value.footerText ?? ''}</IonNote>
      </div>
    </div>
  );
}
