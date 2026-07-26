import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

type Translate = (key: string, params?: TranslateParams) => string;

const CHECKSUM_TAIL_LENGTH = 8;

/** The last characters of a checksum — enough to eyeball a match. */
export function checksumTail(checksum: string): string {
  return checksum.length <= CHECKSUM_TAIL_LENGTH ? checksum : checksum.slice(-CHECKSUM_TAIL_LENGTH);
}

/** The "link valid 15 minutes" toast, citing the checksum tail. */
export function buildDownloadToastMessage(t: Translate, checksum: string): string {
  return t(I18N_KEYS.reports.downloadToast, { checksum: checksumTail(checksum) });
}
