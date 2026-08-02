import type { ContactNoticeTone } from '../contact.constants';

/**
 * Request/response shapes for the backend `POST /contact` relay
 * (email/subject/message, bounded; `{ sent: true }` on a 201). The gateway
 * pins these against the generated contract types, so DTO drift is a compile
 * error rather than a runtime surprise.
 */
export interface ContactRequestDto {
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

export interface ContactResponseDto {
  readonly sent: boolean;
}

/** Prepared retry affordance for a failure the visitor can act on. */
interface ContactNoticeRetry {
  readonly label: string;
  readonly onRetry: () => void;
}

/** The single aria-live announcement above the form: sent, or why not. */
export interface ContactNoticeView {
  readonly tone: ContactNoticeTone;
  readonly title: string;
  readonly message: string;
  readonly retry: ContactNoticeRetry | null;
}
