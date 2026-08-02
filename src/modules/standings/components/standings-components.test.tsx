import { buildAchievementFormView } from '../../../../tests/factories/standings-view.factory';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { fireIonInput } from '../../../../tests/setup/ionic-events.helper';

import { ManualStandingForm } from './manual-standing-form';
import { RecomputeDialog } from './recompute-dialog';
import { RuleVersionForm } from './rule-version-form';
import { StandingsSourceBadge } from './standings-source-badge';
import { TieBreakOrderBuilder } from './tie-break-order-builder';
import { AchievementForm } from './achievement-form';
import { AchievementImportWizard } from './achievement-import-wizard';

const field = (id: string) => ({ id, label: id, value: '0', onChange: vi.fn() });
const noop = vi.fn();

describe('standings dumb components render', () => {
  it('renders the source badge with and without provenance', () => {
    const { rerender } = render(
      <StandingsSourceBadge badge={{ label: 'Manual', tone: 'warning' }} provenance={null} />,
    );
    expect(screen.getAllByTestId(TEST_IDS.standingsSourceBadge).length).toBe(1);
    rerender(
      <StandingsSourceBadge
        badge={{ label: 'Manual', tone: 'warning' }}
        provenance={{
          heading: 'Provenance',
          note: 'from paper',
          reference: 'ref',
          recordedBy: 'coach',
          computedAt: 'today',
          toggleLabel: 'why',
        }}
      />,
    );
  });

  it('renders the recompute dialog', () => {
    render(
      <RecomputeDialog
        view={{
          heading: 'Recompute',
          intro: 'intro',
          ruleLabel: 'Rule',
          ruleValue: 'league',
          ruleOptions: [{ value: 'league', label: 'League' }],
          onRuleChange: noop,
          confirmLabel: 'Recompute',
          cancelLabel: 'Cancel',
          canConfirm: true,
          isRunning: false,
          onConfirm: noop,
          onCancel: noop,
        }}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.standingsRecomputeDialog)).toBeInTheDocument();
  });

  it('renders the manual form', () => {
    const onSubmit = vi.fn();
    render(
      <ManualStandingForm
        view={{
          heading: 'Manual',
          intro: 'intro',
          entrantLabel: 'Entrant',
          entrantValue: 'team',
          entrantOptions: [{ value: 'team', label: 'Our team' }],
          onEntrantChange: noop,
          countFields: [field('played')],
          scoreFields: [field('pf')],
          spiritField: field('spirit'),
          spiritHint: 'hint',
          referenceField: field('ref'),
          noteLabel: 'Note',
          noteHint: 'why',
          noteValue: '',
          onNoteChange: noop,
          ruleLabel: 'Rule',
          ruleValue: '',
          ruleOptions: [],
          onRuleChange: noop,
          validationMessage: 'required',
          submitLabel: 'Record',
          cancelLabel: 'Cancel',
          canSubmit: false,
          isSaving: false,
          onSubmit,
          onCancel: noop,
        }}
      />,
    );
    fireEvent.submit(screen.getByTestId(TEST_IDS.standingsManualForm));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('renders the rule form and tie-break builder', () => {
    const onSubmit = vi.fn();
    const onMoveTieBreak = vi.fn();
    const view = {
      heading: 'Publish',
      keyLabel: 'Key',
      keyHint: 'hint',
      keyValue: '',
      onKeyChange: noop,
      nameLabel: 'Name',
      nameValue: '',
      onNameChange: noop,
      pointFields: [field('win')],
      tieBreakHeading: 'Tie-break',
      tieBreakRows: [
        { key: 'standing_points', label: 'Standing points' },
        { key: 'wins', label: 'Wins' },
      ],
      onMoveTieBreak,
      moveUpLabel: 'Up',
      moveDownLabel: 'Down',
      validationMessage: 'bad',
      submitLabel: 'Publish',
      canSubmit: false,
      isSaving: false,
      onSubmit,
    };
    render(<RuleVersionForm view={view} />);
    fireEvent.submit(screen.getByTestId(TEST_IDS.ruleForm));
    expect(onSubmit).toHaveBeenCalled();

    render(<TieBreakOrderBuilder view={view} />);
    screen.getAllByLabelText('Down').forEach((button) => {
      fireEvent.click(button);
    });
    screen.getAllByLabelText('Up').forEach((button) => {
      fireEvent.click(button);
    });
    expect(onMoveTieBreak).toHaveBeenCalled();
  });

  it('renders the achievement form and import wizard in both steps', () => {
    const onSubmit = vi.fn();
    const onInputChange = vi.fn();
    render(
      <AchievementForm
        view={buildAchievementFormView({ onTitleChange: onInputChange, onSubmit })}
      />,
    );
    fireEvent.submit(screen.getByTestId(TEST_IDS.achievementForm));
    expect(onSubmit).toHaveBeenCalled();

    const base = {
      heading: 'Import',
      intro: 'intro',
      inputLabel: 'CSV',
      inputHint: 'hint',
      inputValue: '',
      onInputChange,
      parseError: 'row 1',
      parseLabel: 'Preview',
      canParse: true,
      onParse: noop,
      previewHeading: null,
      outcomeRows: [],
      totals: null,
      commitLabel: 'Commit',
      canCommit: false,
      isRunning: false,
      onCommit: noop,
      backLabel: 'Back',
      onBack: noop,
    };
    const { rerender } = render(<AchievementImportWizard view={{ ...base, step: 'input' }} />);
    expect(screen.getByTestId(TEST_IDS.achievementImportWizard)).toBeInTheDocument();
    fireIonInput(screen.getByTestId(TEST_IDS.achievementImportInput), 'REF,trophy,T,2026-01-01');
    expect(onInputChange).toHaveBeenCalled();
    rerender(
      <AchievementImportWizard
        view={{
          ...base,
          step: 'preview',
          previewHeading: 'Dry-run',
          totals: '3 received',
          canCommit: true,
          outcomeRows: [
            { key: 'A', reference: 'A', outcome: { label: 'Imported', tone: 'success' } },
          ],
        }}
      />,
    );
  });
});
