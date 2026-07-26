import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fireIonInput, fireIonInputCleared } from '../../../../tests/setup/ionic-events.helper';
import { TEST_IDS } from '@/shared/config';

import {
  buildAchievementsScreenView,
  buildStandingsRulesScreenView,
  buildStandingsScreenView,
  buildTeamHistoryScreenView,
} from '../../../../tests/factories/standings-view.factory';
import { AchievementDetail } from './achievement-detail';
import { AchievementForm } from './achievement-form';
import { AchievementImportWizard } from './achievement-import-wizard';
import { AchievementTransitionBar } from './achievement-transition-bar';
import { AchievementsScreen } from './achievements-view';
import { StandingsManagePanel } from './standings-manage-panel';
import { StandingsRulesList } from './standings-rules-list';
import { StandingsRulesScreen } from './standings-rules-view';
import { StandingsScreen } from './standings-view';
import { StandingsSourceBadge } from './standings-source-badge';
import { StandingsTable } from './standings-table';
import { TeamHistoryScreen } from './team-history-view';

const noop = vi.fn();

describe('standings screen components (both branches)', () => {
  it('renders the standings screen ready and loading', () => {
    const view = render(<StandingsScreen {...buildStandingsScreenView()} />);
    expect(screen.getByTestId(TEST_IDS.standingsTable)).toBeInTheDocument();
    view.unmount();
    render(
      <StandingsScreen
        {...buildStandingsScreenView({ status: 'loading', recomputeBanner: null })}
      />,
    );
  });

  it('renders the standings screen with the manage panel and a banner', () => {
    render(
      <StandingsScreen
        {...buildStandingsScreenView({
          recomputeBanner: 'Derived from 5 matches',
          manage: {
            recomputeLabel: 'Recompute',
            onOpenRecompute: noop,
            manualLabel: 'Manual',
            onOpenManual: noop,
            disabledReason: 'Offline',
            recomputeDialog: null,
            manualForm: null,
          },
        })}
      />,
    );
    expect(screen.getByText('Derived from 5 matches')).toBeInTheDocument();
  });

  it('renders a standings row with a qualification chip and a provenance badge', () => {
    const view = render(
      <StandingsTable
        view={buildStandingsScreenView({
          rows: [
            {
              key: 's2',
              place: '2',
              entrantLabel: 'Giza',
              isOurTeam: false,
              played: '5',
              wins: '3',
              losses: '2',
              ties: '0',
              pointsFor: '55',
              pointsAgainst: '50',
              diff: '+5',
              points: '9',
              spirit: '12',
              qualification: { label: 'Qualified', tone: 'success' },
              qualificationMutedLabel: 'Undecided',
              sourceBadge: { label: 'Manual', tone: 'warning' },
              provenance: {
                heading: 'Provenance',
                note: 'from paper',
                reference: 'ref',
                recordedBy: 'coach',
                computedAt: 'today',
                toggleLabel: 'why',
              },
            },
          ],
        })}
      />,
    );
    expect(view.container).toBeInTheDocument();
  });

  it('renders the manage panel with open dialogs', () => {
    const view = render(
      <StandingsManagePanel
        manage={{
          recomputeLabel: 'Recompute',
          onOpenRecompute: noop,
          manualLabel: 'Manual',
          onOpenManual: noop,
          disabledReason: null,
          recomputeDialog: {
            heading: 'Recompute',
            intro: 'i',
            ruleLabel: 'Rule',
            ruleValue: 'league',
            ruleOptions: [{ value: 'league', label: 'League' }],
            onRuleChange: noop,
            confirmLabel: 'Go',
            cancelLabel: 'Cancel',
            canConfirm: true,
            isRunning: false,
            onConfirm: noop,
            onCancel: noop,
          },
          manualForm: null,
        }}
      />,
    );
    expect(view.container).toBeInTheDocument();
  });

  it('renders the rules screen with a form and a saved banner', () => {
    const view = render(
      <StandingsRulesScreen
        {...buildStandingsRulesScreenView({
          formToggleLabel: 'Publish',
          savedBanner: 'Published',
          isFormOpen: true,
          form: {
            heading: 'Publish',
            keyLabel: 'Key',
            keyHint: 'hint',
            keyValue: '',
            onKeyChange: noop,
            nameLabel: 'Name',
            nameValue: '',
            onNameChange: noop,
            pointFields: [{ id: 'win', label: 'Win', value: '3', onChange: noop }],
            tieBreakHeading: 'Tie-break',
            tieBreakRows: [{ key: 'standing_points', label: 'Standing points' }],
            onMoveTieBreak: noop,
            moveUpLabel: 'Up',
            moveDownLabel: 'Down',
            validationMessage: null,
            submitLabel: 'Publish',
            canSubmit: true,
            isSaving: false,
            onSubmit: noop,
          },
        })}
      />,
    );
    expect(view.container).toBeInTheDocument();
    render(<StandingsRulesScreen {...buildStandingsRulesScreenView({ status: 'loading' })} />);
  });

  it('renders the cabinet with a member chip, load-more, and manage link', () => {
    const view = render(
      <TeamHistoryScreen
        {...buildTeamHistoryScreenView({
          loadMoreLabel: 'Load more',
          manageLink: 'Record',
          seasons: [
            {
              key: 's1',
              heading: 'Season 2026',
              entries: [
                {
                  key: 'a1',
                  iconName: 'medal',
                  title: 'MVP',
                  achievedOn: 'Nov',
                  categoryLabel: 'Award',
                  memberName: 'Omar',
                },
              ],
            },
          ],
        })}
      />,
    );
    render(
      <TeamHistoryScreen
        {...buildTeamHistoryScreenView({ status: 'empty', manageLink: 'Record' })}
      />,
    );
    expect(view.container).toBeInTheDocument();
  });

  it('renders the achievements screen with a form, detail, wizard, and banner', () => {
    const detail = {
      heading: 'Champions',
      facts: [{ key: 'f', label: 'Category', value: 'Trophy' }],
      timelineHeading: 'Progress',
      timeline: [{ key: 'draft', label: 'Draft', isCurrent: true, isReached: true }],
      rejectionReason: 'Not enough evidence',
      rejectionReasonLabel: 'Rejection reason',
      conflictNotice: 'Changed by someone else',
      actions: [
        {
          key: 'approve',
          label: 'Approve',
          tone: 'primary' as const,
          needsConfirm: true,
          onTrigger: noop,
        },
      ],
      confirm: {
        message: 'Approve?',
        reasonLabel: 'Reason',
        reasonHint: 'why',
        reasonValue: '',
        onReasonChange: noop,
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        isRunning: false,
        onConfirm: noop,
        onCancel: noop,
      },
      closeLabel: 'Close',
      onClose: noop,
    };
    const view = render(
      <AchievementsScreen
        {...buildAchievementsScreenView({
          banner: 'Saved',
          createLabel: 'New',
          importLabel: 'Import',
          detail,
          form: null,
          importWizard: null,
        })}
      />,
    );
    expect(view.container).toBeInTheDocument();
    render(<AchievementDetail view={detail} />);
    render(<AchievementTransitionBar view={detail} />);
    render(<AchievementsScreen {...buildAchievementsScreenView({ status: 'forbidden' })} />);
  });

  it('renders the achievements screen with a create form and import wizard present', () => {
    const form = {
      heading: 'Create',
      titleLabel: 'Title',
      titleValue: '',
      onTitleChange: noop,
      categoryLabel: 'Category',
      categoryValue: 'trophy',
      categoryOptions: [{ value: 'trophy', label: 'Trophy' }],
      onCategoryChange: noop,
      dateLabel: 'Date',
      dateValue: '',
      dateDisplayValue: '',
      datePlaceholder: 'pick',
      dateOpenLabel: 'open',
      dateDialogTitle: 'title',
      dateCloseLabel: 'close',
      isDateOpen: false,
      onDateOpen: noop,
      onDateDismiss: noop,
      onDateChange: noop,
      memberLabel: 'Member',
      memberValue: 'none',
      memberOptions: [{ value: 'none', label: 'Team' }],
      onMemberChange: noop,
      descriptionLabel: 'Description',
      descriptionValue: '',
      onDescriptionChange: noop,
      evidenceLabel: 'Evidence',
      evidenceValue: '',
      onEvidenceChange: noop,
      visibilityLabel: 'Visibility',
      visibilityHint: 'hint',
      visibilityValue: 'team',
      visibilityOptions: [{ value: 'team', label: 'Team' }],
      onVisibilityChange: noop,
      validationMessage: null,
      submitLabel: 'Create',
      cancelLabel: 'Cancel',
      canSubmit: false,
      isSaving: false,
      onSubmit: noop,
      onCancel: noop,
    };
    const wizard = {
      heading: 'Import',
      intro: 'intro',
      step: 'done' as const,
      inputLabel: 'CSV',
      inputHint: 'hint',
      inputValue: '',
      onInputChange: noop,
      parseError: null,
      parseLabel: 'Preview',
      canParse: true,
      onParse: noop,
      previewHeading: 'Dry-run',
      outcomeRows: [{ key: 'A', reference: 'A', outcome: { label: 'Imported', tone: 'success' } }],
      totals: '3 received',
      commitLabel: 'Done',
      canCommit: false,
      isRunning: false,
      onCommit: noop,
      backLabel: 'Back',
      onBack: noop,
    };
    const view = render(
      <AchievementsScreen {...buildAchievementsScreenView({ form, importWizard: wizard })} />,
    );
    expect(view.container).toBeInTheDocument();
    render(<AchievementForm view={form} />);
  });

  const manualField = (id: string) => ({ id, label: id, value: '', onChange: noop });

  it('renders the manage panel with the manual reconciliation form open', () => {
    const view = render(
      <StandingsManagePanel
        manage={{
          recomputeLabel: 'Recompute',
          onOpenRecompute: noop,
          manualLabel: 'Manual',
          onOpenManual: noop,
          disabledReason: null,
          recomputeDialog: null,
          manualForm: {
            heading: 'Manual row',
            intro: 'Reconcile from paper',
            entrantLabel: 'Entrant',
            entrantValue: '',
            entrantOptions: [{ value: 'giza', label: 'Giza' }],
            onEntrantChange: noop,
            countFields: [manualField('played'), manualField('wins')],
            scoreFields: [manualField('pointsFor')],
            spiritField: manualField('spirit'),
            spiritHint: 'optional',
            referenceField: manualField('reference'),
            noteLabel: 'Note',
            noteHint: 'why',
            noteValue: '',
            onNoteChange: noop,
            ruleLabel: 'Rule',
            ruleValue: 'league',
            ruleOptions: [{ value: 'league', label: 'League' }],
            onRuleChange: noop,
            validationMessage: 'Provenance is required',
            submitLabel: 'Save',
            cancelLabel: 'Cancel',
            canSubmit: false,
            isSaving: false,
            onSubmit: noop,
            onCancel: noop,
          },
        }}
      />,
    );
    expect(view.container).toBeInTheDocument();
  });

  it('renders the import wizard input step and its preview step', () => {
    const inputWizard = {
      heading: 'Import',
      intro: 'intro',
      step: 'input' as const,
      inputLabel: 'CSV',
      inputHint: 'hint',
      inputValue: '',
      onInputChange: noop,
      parseError: 'Row 2 is invalid',
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
    const view = render(<AchievementImportWizard view={inputWizard} />);
    fireIonInput(screen.getByTestId(TEST_IDS.achievementImportInput), 'A,trophy,Title,2026-01-01');
    expect(screen.getByTestId(TEST_IDS.achievementImportInput)).toBeInTheDocument();
    view.unmount();
    // Input step with no parse error and a cleared (null) textarea value.
    const utils = render(<AchievementImportWizard view={{ ...inputWizard, parseError: null }} />);
    fireIonInputCleared(screen.getByTestId(TEST_IDS.achievementImportInput));
    utils.unmount();
    render(
      <AchievementImportWizard
        view={{
          ...inputWizard,
          step: 'preview',
          parseError: null,
          previewHeading: null,
          totals: null,
          canCommit: true,
          outcomeRows: [
            { key: 'A', reference: 'A', outcome: { label: 'Imported', tone: 'success' } },
          ],
        }}
      />,
    );
  });

  it('renders the transition confirm without a reason hint', () => {
    const view = render(
      <AchievementTransitionBar
        view={{
          heading: 'Champions',
          facts: [],
          timelineHeading: 'Progress',
          timeline: [],
          rejectionReason: null,
          rejectionReasonLabel: 'Rejection reason',
          conflictNotice: null,
          actions: [
            {
              key: 'approve',
              label: 'Approve',
              tone: 'primary',
              needsConfirm: true,
              onTrigger: noop,
            },
          ],
          confirm: {
            message: 'Approve?',
            reasonLabel: 'Reason',
            reasonHint: null,
            reasonValue: '',
            onReasonChange: noop,
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
            isRunning: false,
            onConfirm: noop,
            onCancel: noop,
          },
          closeLabel: 'Close',
          onClose: noop,
        }}
      />,
    );
    expect(view.container).toBeInTheDocument();
  });

  it('renders a rule family with older versions and a subtle derived badge', () => {
    const view = render(
      <StandingsRulesList
        families={[
          {
            key: 'league',
            newest: {
              key: 'rv2',
              heading: 'League v2',
              statusChip: { label: 'Active', tone: 'success' },
              points: ['Win 3'],
              tieBreakChips: ['Standing points'],
              effectiveFrom: 'June',
            },
            older: [
              {
                key: 'rv1',
                heading: 'League v1',
                statusChip: { label: 'Archived', tone: 'medium' },
                points: ['Win 2'],
                tieBreakChips: ['Wins'],
                effectiveFrom: 'January',
              },
            ],
            olderLabel: '1 older version',
          },
        ]}
      />,
    );
    render(
      <StandingsSourceBadge
        badge={{ label: 'Import', tone: 'tertiary' }}
        provenance={{
          heading: 'Provenance',
          note: 'imported',
          reference: null,
          recordedBy: null,
          computedAt: 'today',
          toggleLabel: 'why',
        }}
      />,
    );
    expect(view.container).toBeInTheDocument();
  });
});
