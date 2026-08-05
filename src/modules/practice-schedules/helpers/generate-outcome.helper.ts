import type { GenerationResult } from '../types/practice-schedules.types';

/** A finished action's message: which key to render, and with what numbers. */
export interface GenerateOutcome {
  readonly key: string;
  readonly params: Readonly<Record<string, number>>;
}

/**
 * What to tell the coach after a generation run.
 *
 * `created === 0` is always an explicit sentence, never silence — but it is
 * not always the SAME sentence: an idempotent re-run that found the window
 * already fully generated (`skipped > 0`) is a different story from a window
 * with nothing in it at all (`skipped === 0` too). Conflating them would tell
 * a coach who just extended the pattern's window that nothing happened, when
 * what actually happened is there was nothing there yet. A run that made new
 * sessions always names how many.
 */
export function describeGeneration(
  result: GenerationResult,
  keys: {
    readonly created: string;
    readonly createdWithSkipped: string;
    readonly nothingNew: string;
    readonly nothingToGenerate: string;
  },
): GenerateOutcome {
  if (result.created === 0 && result.skipped === 0) {
    return { key: keys.nothingToGenerate, params: {} };
  }
  if (result.created === 0) {
    return { key: keys.nothingNew, params: { skipped: result.skipped } };
  }
  if (result.skipped > 0) {
    return {
      key: keys.createdWithSkipped,
      params: { created: result.created, skipped: result.skipped },
    };
  }
  return { key: keys.created, params: { created: result.created } };
}
