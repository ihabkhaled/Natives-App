import { HTTP_ERROR_KIND, isHttpError, type HttpError } from '@/packages/http';

/**
 * The only failure kinds worth a retry: the request may genuinely succeed on
 * a second attempt. Everything else — auth, permission, validation, missing
 * resources, contract drift — is deterministic: the server already gave its
 * answer, and retrying can only mask the honest error behind a loading state.
 */
const TRANSIENT_KINDS: readonly string[] = [
  HTTP_ERROR_KIND.Network,
  HTTP_ERROR_KIND.Timeout,
  HTTP_ERROR_KIND.RateLimited,
  HTTP_ERROR_KIND.Server,
];

const STATUS_REQUEST_TIMEOUT = 408;
const STATUS_TOO_MANY_REQUESTS = 429;
const STATUS_SERVER_ERROR_FLOOR = 500;

function isTransientStatus(status: number): boolean {
  return (
    status >= STATUS_SERVER_ERROR_FLOOR ||
    status === STATUS_REQUEST_TIMEOUT ||
    status === STATUS_TOO_MANY_REQUESTS
  );
}

/**
 * Feature services wrap the transport failure in an AppError whose `cause`
 * carries the original HttpError, so the retry decision unwraps one level to
 * reach the kind the HTTP owner classified.
 */
function resolveHttpError(error: unknown): HttpError | null {
  if (isHttpError(error)) {
    return error;
  }
  const cause = (error as { cause?: unknown } | null)?.cause;
  return isHttpError(cause) ? cause : null;
}

/**
 * Whether a query failure is transient (network drop, timeout, 5xx, 408, 429)
 * and therefore worth a bounded retry. Deterministic failures — 401/403/404,
 * validation, conflicts, contract errors, and anything unrecognized — are
 * never retried: they surface immediately as the designed error state instead
 * of masquerading as "Loading…" behind a retry loop.
 */
export function isTransientFailure(error: unknown): boolean {
  const httpError = resolveHttpError(error);
  if (httpError !== null) {
    if (TRANSIENT_KINDS.includes(httpError.kind)) {
      return true;
    }
    return httpError.status !== undefined && isTransientStatus(httpError.status);
  }
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === 'number' && isTransientStatus(status);
}
