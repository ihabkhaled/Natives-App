import { describe, expect, it } from 'vitest';

import { cx } from './ui-classes.facade';

/** Mirrors how a component composes classes from a computed flag. */
function stateClasses(isActive: boolean): string {
  return cx('base', isActive && 'active', undefined, null, '');
}

function toneClasses(isDanger: boolean): string {
  return cx('text-slate-900', isDanger && 'text-red-600');
}

describe('cx', () => {
  it('joins plain class names', () => {
    expect(cx('flex', 'items-center')).toBe('flex items-center');
  });

  it('drops falsy conditional entries', () => {
    expect(stateClasses(false)).toBe('base');
  });

  it('keeps truthy conditional entries', () => {
    expect(stateClasses(true)).toBe('base active');
  });

  it('supports object and array inputs', () => {
    expect(cx(['flex', 'gap-2'], { hidden: false, 'font-bold': true })).toBe(
      'flex gap-2 font-bold',
    );
  });

  it('resolves conflicting tailwind utilities in favor of the last one', () => {
    expect(cx('p-2', 'p-4')).toBe('p-4');
    expect(cx('text-sm text-red-500', 'text-lg')).toBe('text-red-500 text-lg');
    expect(cx(['grid', 'gap-2'], 'block')).toBe('gap-2 block');
  });

  it('keeps non-conflicting tailwind utilities', () => {
    expect(cx('px-2', 'py-4')).toBe('px-2 py-4');
  });

  it('lets a conditional override win the conflict', () => {
    expect(toneClasses(true)).toBe('text-red-600');
    expect(toneClasses(false)).toBe('text-slate-900');
  });

  it('returns an empty string without inputs', () => {
    expect(cx()).toBe('');
  });
});
