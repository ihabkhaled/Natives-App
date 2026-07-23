import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReportBrandingValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import {
  fireIonInput,
  fireIonInputCleared,
} from '../../../../../../tests/setup/ionic-events.helper';
import { ReportBrandingEditor } from './report-branding-editor.component';

const VALUE: ReportBrandingValue = {
  displayName: 'Ultimate Natives',
  accentColor: '#1B7F4D',
  footerText: 'Powered by Ultimate Natives',
};

function mountEditor(onChange = vi.fn(), value: ReportBrandingValue = VALUE) {
  render(
    <ReportBrandingEditor value={value} onChange={onChange} context={buildTestEditorContext()} />,
  );
  return onChange;
}

describe('ReportBrandingEditor', () => {
  it('previews the report identity live: name, accent bar, footer', () => {
    mountEditor();

    const preview = screen.getByTestId('admin-branding-preview');
    expect(preview).toHaveTextContent('Ultimate Natives');
    expect(preview).toHaveTextContent('Powered by Ultimate Natives');
    expect(screen.getByTestId('admin-branding-preview-bar')).toHaveStyle({
      backgroundColor: '#1B7F4D',
    });
  });

  it('falls back to the default accent while none is set', () => {
    mountEditor(vi.fn(), { displayName: 'Natives' });

    expect(screen.getByTestId('admin-branding-preview-bar')).toHaveStyle({
      backgroundColor: '#1B7F4D',
    });
  });

  it('patches the display name verbatim', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-setting-editor-displayName'), 'Cairo Natives');

    expect(onChange).toHaveBeenCalledWith({ ...VALUE, displayName: 'Cairo Natives' });
  });

  it('treats a cleared optional field as not provided', () => {
    const onChange = mountEditor();

    fireIonInputCleared(screen.getByTestId('admin-setting-editor-accentColor'));

    const next = onChange.mock.calls[0]?.[0] as ReportBrandingValue;
    expect(next.accentColor).toBeUndefined();
  });

  it('sets the contact email and logo key', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-setting-editor-contactEmail'), 'team@natives.example');
    fireIonInput(screen.getByTestId('admin-setting-editor-logoMediaKey'), 'teams/natives/logo.png');

    expect((onChange.mock.calls[0]?.[0] as ReportBrandingValue).contactEmail).toBe(
      'team@natives.example',
    );
    expect((onChange.mock.calls[1]?.[0] as ReportBrandingValue).logoMediaKey).toBe(
      'teams/natives/logo.png',
    );
  });
});
