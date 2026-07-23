/**
 * Member self-service test ids (Wave F0): the session-detail attendance CTA,
 * the /my-attendance screen, the performance tabs with the own score card and
 * measurement history, and the dashboard widget deep links. Split out of the
 * aggregate catalog so TEST_IDS stays within its size budget; raw test ids
 * remain forbidden everywhere else (ESLint: architecture/no-inline-test-ids).
 */
export const SELF_SERVICE_TEST_IDS = {
  practiceSessionAttendanceCta: 'practice-session-attendance-cta',
  myAttendancePage: 'my-attendance-page',
  myAttendanceView: 'my-attendance-view',
  myAttendanceLoading: 'my-attendance-loading',
  myAttendanceError: 'my-attendance-error',
  myAttendanceOffline: 'my-attendance-offline',
  myAttendanceForbidden: 'my-attendance-forbidden',
  myAttendanceEmpty: 'my-attendance-empty',
  myAttendanceParticipationCard: 'my-attendance-participation-card',
  myAttendanceParticipationRate: 'my-attendance-participation-rate',
  myAttendanceParticipationBreakdown: 'my-attendance-participation-breakdown',
  myAttendanceRuleNotice: 'my-attendance-rule-notice',
  myAttendanceCheckInCard: 'my-attendance-check-in-card',
  myAttendanceCheckInButton: 'my-attendance-check-in-button',
  myAttendanceCheckInStatus: 'my-attendance-check-in-status',
  myAttendanceCheckInNote: 'my-attendance-check-in-note',
  performanceTabBar: 'performance-tab-bar',
  performanceTab: 'performance-tab',
  performanceScoreCard: 'performance-score-card',
  performanceScoreValue: 'performance-score-value',
  performanceScoreExplanation: 'performance-score-explanation',
  measurementHistoryPanel: 'measurement-history-panel',
  measurementProtocolCard: 'measurement-protocol-card',
  dashboardWidgetLink: 'dashboard-widget-link',
} as const;
