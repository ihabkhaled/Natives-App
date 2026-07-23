import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { SectionPanel } from '@/shared/ui';

import type { ParticipationSummaryCardProps } from './participation-summary-card.types';

/**
 * Own participation summary: the rate (or an honest "not enough data"), the
 * per-status breakdown, and the cited rule — including the calm "not
 * configured yet" body when the backend has no approved attendance rule.
 */
export function ParticipationSummaryCard(props: ParticipationSummaryCardProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel heading={view.title} testId={TEST_IDS.myAttendanceParticipationCard}>
      {view.isNotConfigured ? (
        <IonNote data-testid={TEST_IDS.myAttendanceRuleNotice} className="block">
          {view.notConfiguredMessage}
        </IonNote>
      ) : (
        <div className="flex flex-col gap-4">
          <div
            data-testid={TEST_IDS.myAttendanceParticipationRate}
            className="app-my-attendance__rate"
          >
            <IonNote className="block text-xs uppercase tracking-wide">{view.rateLabel}</IonNote>
            <IonText>
              <p className={`m-0 font-bold ${view.hasRate ? 'text-4xl' : 'text-lg'}`}>
                {view.rateText}
              </p>
            </IonText>
          </div>
          <dl
            data-testid={TEST_IDS.myAttendanceParticipationBreakdown}
            className="m-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4"
          >
            {view.breakdown.map((row) => (
              <div key={row.key} className="flex flex-col">
                <dt className="text-xs opacity-70">{row.label}</dt>
                <dd className="m-0 text-base font-semibold">{row.valueText}</dd>
              </div>
            ))}
          </dl>
          <IonNote data-testid={TEST_IDS.myAttendanceRuleNotice} className="block text-xs">
            {view.ruleNotice}
            {view.candidateNotice === null ? null : (
              <span className="block">{view.candidateNotice}</span>
            )}
          </IonNote>
        </div>
      )}
    </SectionPanel>
  );
}
