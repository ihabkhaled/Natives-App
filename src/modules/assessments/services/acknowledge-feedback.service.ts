import { requestAcknowledgeFeedback } from '../gateways/development.gateway';
import { runAssessmentsRequest } from '../helpers/to-assessments-error.helper';
import type { AcknowledgeFeedbackInput } from '../types/assessments.types';

/** Use case: record that the player read one published feedback record. */
export function acknowledgeFeedback(
  teamId: string,
  input: AcknowledgeFeedbackInput,
): Promise<string> {
  return runAssessmentsRequest(async () => {
    const dto = await requestAcknowledgeFeedback(
      teamId,
      input.feedbackId,
      input.clarificationRequested,
    );
    return dto.acknowledgedAt;
  });
}
