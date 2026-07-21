import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlayerReportPanel } from './player-report-panel.component';

const REPORT = {
  heading: 'Report — Mai Salah',
  facts: [{ key: 'goals', label: 'Goals', value: '0' }],
  zeroNotice: 'This player was rostered and recorded no contribution.',
  missingNotice: null,
  closeLabel: 'Close report',
};

describe('PlayerReportPanel', () => {
  it('prompts for a selection while no player is open', () => {
    render(
      <PlayerReportPanel
        heading="Player match report"
        intro="Open a player to read their report."
        report={null}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Open a player to read their report.')).toHaveLength(1);
    expect(screen.queryByText('Close report')).not.toBeInTheDocument();
  });

  it('renders the report and says a zero line is a measured zero', () => {
    const onClose = vi.fn();
    render(
      <PlayerReportPanel
        heading="Player match report"
        intro="Open a player."
        report={REPORT}
        onClose={onClose}
      />,
    );

    expect(screen.getByText('Report — Mai Salah')).toBeInTheDocument();
    expect(screen.getByText(REPORT.zeroNotice)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close report'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('says which measures the stream could not support', () => {
    render(
      <PlayerReportPanel
        heading="Player match report"
        intro="Open a player."
        report={{ ...REPORT, zeroNotice: null, missingNotice: 'Some measures are unavailable.' }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Some measures are unavailable.')).toBeInTheDocument();
  });
});
