import { MEMBER_ROLE_LABEL_KEYS } from '../constants/members.constants';

type Translate = (key: string) => string;

/** Humanize a server slug for display: `physio_lead` → `Physio Lead`. */
export function humanizeRoleSlug(slug: string): string {
  return slug
    .split('_')
    .filter((part) => part !== '')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Resolve the display label for a team-role slug without ever hard-coding the
 * catalog: a slug the client ships copy for renders translated; otherwise the
 * server's `displayName` wins; otherwise the humanized slug keeps an unseen
 * future role legible instead of raw or blank.
 */
export function resolveRoleLabel(t: Translate, slug: string, serverDisplayName?: string): string {
  const knownKey = MEMBER_ROLE_LABEL_KEYS[slug];
  if (knownKey !== undefined) {
    return t(knownKey);
  }
  if (serverDisplayName !== undefined && serverDisplayName.trim() !== '') {
    return serverDisplayName;
  }
  return humanizeRoleSlug(slug);
}
