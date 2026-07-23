import { I18N_KEYS } from '@/shared/i18n';

type Translate = (key: string) => string;

/**
 * Every fixed label the invite form renders, resolved in one pass. The role
 * OPTIONS are deliberately absent: they are server-driven and built by the
 * hook from the assignable-roles query, never from a client catalog.
 */
export interface InviteFormCopy {
  readonly openLabel: string;
  readonly title: string;
  readonly intro: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly roleLabel: string;
  readonly profileHeading: string;
  readonly profileIntro: string;
  readonly fullNameLabel: string;
  readonly fullNamePlaceholder: string;
  readonly nicknameLabel: string;
  readonly jerseyLabel: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;
}

/**
 * The invite form's static copy. Split out of the hook so the hook reads as
 * state and behaviour rather than as a wall of translation calls.
 */
export function buildInviteFormCopy(t: Translate): InviteFormCopy {
  return {
    openLabel: t(I18N_KEYS.members.invite),
    title: t(I18N_KEYS.members.inviteTitle),
    intro: t(I18N_KEYS.members.inviteIntro),
    emailLabel: t(I18N_KEYS.members.inviteEmailLabel),
    emailPlaceholder: t(I18N_KEYS.members.inviteEmailPlaceholder),
    roleLabel: t(I18N_KEYS.members.inviteRoleLabel),
    profileHeading: t(I18N_KEYS.members.inviteProfileHeading),
    profileIntro: t(I18N_KEYS.members.inviteProfileIntro),
    fullNameLabel: t(I18N_KEYS.members.inviteFullNameLabel),
    fullNamePlaceholder: t(I18N_KEYS.members.inviteFullNamePlaceholder),
    nicknameLabel: t(I18N_KEYS.members.inviteNicknameLabel),
    jerseyLabel: t(I18N_KEYS.members.inviteJerseyLabel),
    submitLabel: t(I18N_KEYS.members.inviteSubmit),
    submittingLabel: t(I18N_KEYS.members.inviteSubmitting),
    cancelLabel: t(I18N_KEYS.members.inviteCancel),
  };
}
