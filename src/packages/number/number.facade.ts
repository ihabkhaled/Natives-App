/**
 * The single owner of `Intl` number formatting. Feature code asks for a
 * finished string; nothing outside this directory constructs an
 * `Intl.NumberFormat` or calls `toLocaleString` (enforced by the
 * `capacitor-ranger/intl-ownership` ESLint block).
 *
 * Digits stay Latin on purpose. CLDR resolves the bare `ar` locale to the
 * `latn` numbering system, and this is a Frisbee app: scores, jersey numbers,
 * ranks, and the clock have to stay scannable for a squad that reads both
 * scripts. Separators, sign placement, and percent-sign side still follow the
 * active locale, which is the part a hand-built `${value}%` always gets wrong.
 */

/** Constructing an `Intl` formatter is the expensive part; reusing one is free. */
const NUMBER_FORMATTERS = new Map<string, Intl.NumberFormat>();

const DECIMAL_OPTIONS: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

const SIGNED_OPTIONS: Intl.NumberFormatOptions = {
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
};

const PERCENT_OPTIONS: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 };

/** U+2068 / U+2069: an isolate pair the bidi algorithm will not reorder across. */
const FIRST_STRONG_ISOLATE = '⁨';
const POP_DIRECTIONAL_ISOLATE = '⁩';

/** The en dash between two scores, with the spacing typographers expect. */
const SCORE_SEPARATOR = ' – ';

function formatterFor(
  locale: string,
  variant: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const cacheKey = `${locale}:${variant}`;
  const cached = NUMBER_FORMATTERS.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const created = new Intl.NumberFormat(locale, options);
  NUMBER_FORMATTERS.set(cacheKey, created);
  return created;
}

/** A count, total, rank, or jersey number grouped for the active locale. */
export function formatNumber(value: number, locale: string): string {
  return formatterFor(locale, 'decimal', DECIMAL_OPTIONS).format(value);
}

/**
 * A signed delta, where the sign carries the meaning: `+5`, `-3`, and a plain
 * `0` for a movement that did not happen. Never used for a magnitude.
 */
export function formatSignedNumber(value: number, locale: string): string {
  return formatterFor(locale, 'signed', SIGNED_OPTIONS).format(value);
}

/**
 * A percentage the API already expressed on a 0–100 scale. `Intl` puts the
 * percent sign on the locale's side and wraps it in the bidi marks an Arabic
 * paragraph needs; `${value}%` renders as `%76` there.
 */
export function formatPercent(percentValue: number, locale: string): string {
  return formatterFor(locale, 'percent', PERCENT_OPTIONS).format(percentValue / 100);
}

/**
 * A score line that survives RTL. Unicode treats the dash between two numbers
 * as neutral and resolves it right-to-left inside an Arabic paragraph, so a
 * bare `8 – 6` renders as `6 – 8` and silently reverses the result. The
 * isolates pin the run to its own direction.
 */
export function formatScorePair(ourScore: number, opponentScore: number, locale: string): string {
  const line = `${formatNumber(ourScore, locale)}${SCORE_SEPARATOR}${formatNumber(opponentScore, locale)}`;
  return `${FIRST_STRONG_ISOLATE}${line}${POP_DIRECTIONAL_ISOLATE}`;
}
