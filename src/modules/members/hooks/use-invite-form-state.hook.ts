import { useState } from 'react';

import { formatDateTime } from '@/packages/date';

import { MEMBER_ROLE } from '../constants/members.constants';

export interface InviteFormState {
  readonly isOpen: boolean;
  readonly isSubmitted: boolean;
  readonly email: string;
  readonly role: string;
  readonly fullName: string;
  readonly nickname: string;
  readonly jersey: string;
  readonly setEmail: (value: string) => void;
  readonly setRole: (value: string) => void;
  readonly setFullName: (value: string) => void;
  readonly setNickname: (value: string) => void;
  readonly setJersey: (value: string) => void;
  readonly open: () => void;
  readonly close: () => void;
  readonly reset: () => void;
  readonly markSubmitted: () => void;
  readonly formatExpiry: (iso: string) => string;
}

/**
 * The invite form's raw field state, kept out of the view hook so that hook
 * stays a wiring list. Values stay strings: a half-typed jersey number is
 * honest state, not a parse failure.
 */
export function useInviteFormState(locale: string): InviteFormState {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(MEMBER_ROLE.member);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [jersey, setJersey] = useState('');
  const clear = (): void => {
    setEmail('');
    setRole(MEMBER_ROLE.member);
    setFullName('');
    setNickname('');
    setJersey('');
    setIsSubmitted(false);
  };
  return {
    isOpen,
    isSubmitted,
    email,
    role,
    fullName,
    nickname,
    jersey,
    setEmail,
    setRole,
    setFullName,
    setNickname,
    setJersey,
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      clear();
    },
    reset: clear,
    markSubmitted: () => {
      setIsSubmitted(true);
    },
    formatExpiry: (iso) => formatDateTime(iso, locale),
  };
}
