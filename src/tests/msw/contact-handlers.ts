import { http, HttpResponse } from 'msw';

import { MOCK_CONTACT, MOCK_CONTACT_LIMITS } from './contact.fixture';
import { apiUrl, readJsonBody } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';

const CONTACT_PATH = '/contact';
const CONTACT_API_PATH = `/api/v1${CONTACT_PATH}`;
const ALLOWED_KEYS: readonly string[] = ['email', 'subject', 'message'];

/** One side of an address; split-then-test avoids a backtracking pattern. */
const EMAIL_PART = /^[^\s@]+$/u;

interface WireFieldError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
}

function fieldError(field: string, code: string): WireFieldError {
  return { field, code, message: `${field} is invalid` };
}

function trimmedLength(value: unknown): number {
  return typeof value === 'string' ? value.trim().length : -1;
}

function isWithin(value: unknown, min: number, max: number): boolean {
  const length = trimmedLength(value);
  return length >= min && length <= max;
}

/** Close enough to the DTO's `@IsEmail` for a mock: one `@`, a dotted domain. */
function isEmailShaped(value: unknown): boolean {
  const [local, domain, ...extra] = typeof value === 'string' ? value.trim().split('@') : [];
  return (
    extra.length === 0 &&
    local !== undefined &&
    domain !== undefined &&
    EMAIL_PART.test(local) &&
    EMAIL_PART.test(domain) &&
    domain.includes('.')
  );
}

/**
 * The bounds `ContactRequestDto` declares, plus NestJS `forbidNonWhitelisted`
 * behaviour: an unknown extra property is a 400 exactly like a bad value.
 */
function collectBodyErrors(body: Readonly<Record<string, unknown>>): readonly WireFieldError[] {
  const limits = MOCK_CONTACT_LIMITS;
  const unknownKeys = Object.keys(body).filter((key) => !ALLOWED_KEYS.includes(key));
  return [
    ...unknownKeys.map((key) => fieldError(key, 'UNKNOWN_PROPERTY')),
    ...(isEmailShaped(body['email']) && isWithin(body['email'], 1, limits.emailMaxLength)
      ? []
      : [fieldError('email', 'INVALID_EMAIL')]),
    ...(isWithin(body['subject'], limits.subjectMinLength, limits.subjectMaxLength)
      ? []
      : [fieldError('subject', 'LENGTH_OUT_OF_RANGE')]),
    ...(isWithin(body['message'], limits.messageMinLength, limits.messageMaxLength)
      ? []
      : [fieldError('message', 'LENGTH_OUT_OF_RANGE')]),
  ];
}

function scenarioResponse(email: unknown): Response | null {
  if (email === MOCK_CONTACT.channelDisabledEmail) {
    return nestErrorResponse({
      statusCode: 503,
      code: 'CONTACT_CHANNEL_UNAVAILABLE',
      message: 'The operator email channel is disabled',
      path: CONTACT_API_PATH,
    });
  }
  if (email === MOCK_CONTACT.rateLimitedEmail) {
    return nestErrorResponse({
      statusCode: 429,
      code: 'RATE_LIMITED',
      message: 'Too many messages',
      path: CONTACT_API_PATH,
    });
  }
  return null;
}

/**
 * Public contact relay (`POST /contact`, contract 1.7.0). Mirrors every
 * documented status: 201 `{ sent: true }`, 400 for an invalid body or an
 * unknown extra property, 429 once rate-limited, and 503 when the operator
 * email channel is disabled or unconfigured.
 */
export const contactHandlers = [
  http.post(apiUrl(CONTACT_PATH), async ({ request }) => {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const errors = collectBodyErrors(body);
    if (errors.length > 0) {
      return nestErrorResponse({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        path: CONTACT_API_PATH,
        errors,
      });
    }
    return scenarioResponse(body['email']) ?? HttpResponse.json({ sent: true }, { status: 201 });
  }),
];
