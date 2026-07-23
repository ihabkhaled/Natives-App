import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { RosterLimitsValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import { fireIonChange, fireIonInput } from '../../../../../../tests/setup/ionic-events.helper';
import { RosterLimitsEditor } from './roster-limits-editor.component';

const VALUE: RosterLimitsValue = {
  roster: { min: 10, max: 27 },
  matchSquad: { min: 7, max: 15 },
  perPosition: [{ positionKey: 'handler', max: 8 }],
};

function mountEditor(onChange = vi.fn()) {
  render(
    <RosterLimitsEditor value={VALUE} onChange={onChange} context={buildTestEditorContext()} />,
  );
  return onChange;
}

describe('RosterLimitsEditor', () => {
  it('groups roster and match-squad bounds with the full-line hint', () => {
    mountEditor();

    expect(screen.getByTestId('admin-setting-editor-roster-max')).toHaveValue('27');
    expect(screen.getByTestId('admin-setting-editor-matchSquad-min')).toHaveValue('7');
    expect(screen.getByText('settingEditors.squadFloorHint')).toBeInTheDocument();
  });

  it('patches a bound as a number', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-setting-editor-roster-max'), '30');

    const next = onChange.mock.calls[0]?.[0] as RosterLimitsValue;
    expect(next.roster.max).toBe(30);
  });

  it('selects position caps from the active catalog only', () => {
    mountEditor();

    const select = screen.getByTestId('admin-editor-row-position-0');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Handler')).toBeInTheDocument();
    expect(screen.queryByText('Cutter')).not.toBeInTheDocument();
  });

  it('re-targets a cap at another position', () => {
    const onChange = mountEditor();

    fireIonChange(screen.getByTestId('admin-editor-row-position-0'), 'handler');

    const next = onChange.mock.calls[0]?.[0] as RosterLimitsValue;
    expect(next.perPosition?.[0]?.positionKey).toBe('handler');
  });

  it('patches a cap and adds a new one from the catalog head', async () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-position-max-0'), '9');
    await userEvent.click(screen.getByTestId('admin-editor-add'));

    const patched = onChange.mock.calls[0]?.[0] as RosterLimitsValue;
    expect(patched.perPosition?.[0]?.max).toBe(9);
    const added = onChange.mock.calls[1]?.[0] as RosterLimitsValue;
    expect(added.perPosition).toHaveLength(2);
    expect(added.perPosition?.[1]?.positionKey).toBe('handler');
  });

  it('removes a cap on request', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getByLabelText('settingEditors.remove'));

    const next = onChange.mock.calls[0]?.[0] as RosterLimitsValue;
    expect(next.perPosition).toEqual([]);
  });

  it('moves a position cap with the shared reorder controls', async () => {
    const onChange = vi.fn();
    render(
      <RosterLimitsEditor
        value={{
          roster: { max: 27 },
          perPosition: [
            { positionKey: 'handler', max: 8 },
            { positionKey: 'cutter', max: 12 },
          ],
        }}
        onChange={onChange}
        context={buildTestEditorContext()}
      />,
    );

    await userEvent.click(screen.getAllByLabelText('settingEditors.moveDown')[0]!);

    const next = onChange.mock.calls[0]?.[0] as RosterLimitsValue;
    expect(next.perPosition?.map((entry) => entry.positionKey)).toEqual(['cutter', 'handler']);
  });

  it('clears the squad minimum back to "not provided"', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-setting-editor-matchSquad-min'), '');

    const next = onChange.mock.calls[0]?.[0] as RosterLimitsValue;
    expect(next.matchSquad?.min).toBeUndefined();
    expect(next.matchSquad?.max).toBe(15);
  });

  it('renders honestly empty bounds while nothing optional is configured', () => {
    render(
      <RosterLimitsEditor
        value={{ roster: { max: 27 } }}
        onChange={vi.fn()}
        context={buildTestEditorContext()}
      />,
    );

    expect(screen.getByTestId('admin-setting-editor-matchSquad-max')).toHaveValue('');
    expect(screen.getByTestId('admin-setting-editor-roster-min')).toHaveValue('');
  });
});
