import { afterEach, describe, expect, it } from 'vitest';

import { applyDocumentLocale, applyDocumentTheme } from './document-chrome.facade';

const DARK_PALETTE_CLASS = 'ion-palette-dark';

afterEach(() => {
  document.documentElement.className = '';
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
});

describe('applyDocumentTheme', () => {
  it('adds the Ionic dark palette class for the dark theme', () => {
    applyDocumentTheme(true);

    expect(document.documentElement).toHaveClass(DARK_PALETTE_CLASS);
  });

  it('removes the dark palette class for the light theme', () => {
    applyDocumentTheme(true);
    applyDocumentTheme(false);

    expect(document.documentElement).not.toHaveClass(DARK_PALETTE_CLASS);
  });

  it('is idempotent in both directions', () => {
    applyDocumentTheme(true);
    applyDocumentTheme(true);

    expect(document.documentElement.className).toBe(DARK_PALETTE_CLASS);

    applyDocumentTheme(false);
    applyDocumentTheme(false);

    expect(document.documentElement.className).toBe('');
  });

  it('leaves unrelated classes untouched', () => {
    document.documentElement.classList.add('md');

    applyDocumentTheme(true);

    expect(document.documentElement).toHaveClass('md', DARK_PALETTE_CLASS);
  });
});

describe('applyDocumentLocale', () => {
  it('applies an RTL locale to the document root', () => {
    applyDocumentLocale('ar', 'rtl');

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('applies an LTR locale to the document root', () => {
    applyDocumentLocale('en', 'ltr');

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('overwrites a previously applied locale', () => {
    applyDocumentLocale('ar', 'rtl');
    applyDocumentLocale('en', 'ltr');

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
