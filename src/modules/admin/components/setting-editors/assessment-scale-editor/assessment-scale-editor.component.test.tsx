import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AssessmentScaleValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import { fireIonInput } from '../../../../../../tests/setup/ionic-events.helper';
import { AssessmentScaleEditor } from './assessment-scale-editor.component';

const VALUE: AssessmentScaleValue = {
  min: 1,
  max: 5,
  step: 1,
  bands: [{ key: 'solid', labelEn: 'Solid', labelAr: 'ثابت', from: 1, to: 3 }],
};

function mountEditor(onChange = vi.fn(), scalePreview: string | null = null) {
  render(
    <AssessmentScaleEditor
      value={VALUE}
      onChange={onChange}
      context={buildTestEditorContext({ scalePreview })}
    />,
  );
  return onChange;
}

describe('AssessmentScaleEditor', () => {
  it('renders the scale bounds and the live preview when provided', () => {
    mountEditor(vi.fn(), '5 points: 1, 2, 3, 4, 5');

    expect(screen.getByTestId('admin-setting-editor-min')).toHaveValue('1');
    expect(screen.getByTestId('admin-setting-editor-preview')).toHaveTextContent('5 points');
  });

  it('patches a scale scalar', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-setting-editor-max'), '10');

    expect(onChange).toHaveBeenCalledWith({ ...VALUE, max: 10 });
  });

  it('patches a band bound as an integer', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-band-to-0'), '4');

    const next = onChange.mock.calls[0]?.[0] as AssessmentScaleValue;
    expect(next.bands?.[0]?.to).toBe(4);
  });

  it('adds a band after the last one', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getByTestId('admin-editor-add'));

    const next = onChange.mock.calls[0]?.[0] as AssessmentScaleValue;
    expect(next.bands).toHaveLength(2);
    expect(next.bands?.[1]?.from).toBe(4);
  });

  it('removes a band on request', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getByLabelText('settingEditors.remove'));

    const next = onChange.mock.calls[0]?.[0] as AssessmentScaleValue;
    expect(next.bands).toEqual([]);
  });

  it('renames a band key through its input', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-band-key-0'), 'strong');

    const next = onChange.mock.calls[0]?.[0] as AssessmentScaleValue;
    expect(next.bands?.[0]?.key).toBe('strong');
  });

  it('patches min, step, the band floor, and the bilingual band labels', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-setting-editor-min'), '0');
    fireIonInput(screen.getByTestId('admin-setting-editor-step'), '2');
    fireIonInput(screen.getByTestId('admin-editor-row-band-from-0'), '2');
    fireIonInput(screen.getByTestId('band-0-label-en'), 'Steady');
    fireIonInput(screen.getByTestId('band-0-label-ar'), 'ثابت جدًا');

    const changes = onChange.mock.calls.map((call) => call[0] as AssessmentScaleValue);
    expect(changes[0]!.min).toBe(0);
    expect(changes[1]!.step).toBe(2);
    expect(changes[2]!.bands![0]!.from).toBe(2);
    expect(changes[3]!.bands![0]!.labelEn).toBe('Steady');
    expect(changes[4]!.bands![0]!.labelAr).toBe('ثابت جدًا');
  });

  it('moves a band with the shared reorder controls', async () => {
    const onChange = vi.fn();
    render(
      <AssessmentScaleEditor
        value={{
          min: 1,
          max: 10,
          step: 1,
          bands: [
            { key: 'solid', labelEn: 'Solid', labelAr: 'ثابت', from: 1, to: 3 },
            { key: 'elite', labelEn: 'Elite', labelAr: 'نخبة', from: 4, to: 10 },
          ],
        }}
        onChange={onChange}
        context={buildTestEditorContext()}
      />,
    );

    await userEvent.click(screen.getAllByLabelText('settingEditors.moveUp')[1]!);

    const next = onChange.mock.calls[0]?.[0] as AssessmentScaleValue;
    expect(next.bands?.map((band) => band.key)).toEqual(['elite', 'solid']);
  });
});
