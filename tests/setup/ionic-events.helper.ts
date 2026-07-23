import { fireEvent } from '@testing-library/react';

/** Fire Ionic custom events (ionInput/ionBlur/ionChange) in jsdom tests. */
export function fireIonInput(element: Element, value: string): void {
  fireEvent(element, new CustomEvent('ionInput', { detail: { value } }));
}

export function fireIonBlur(element: Element): void {
  fireEvent(element, new CustomEvent('ionBlur'));
}

export function fireIonChange(element: Element, value: string): void {
  fireEvent(element, new CustomEvent('ionChange', { detail: { value } }));
}

/** Fire an ion-checkbox change, which reports `checked` rather than a value. */
export function fireIonCheckboxChange(element: Element, checked: boolean): void {
  fireEvent(element, new CustomEvent('ionChange', { detail: { checked } }));
}

/**
 * Fire an ion-checkbox change from its label text node. The event bubbles to
 * the hosting ion-checkbox, so tests can address a toggle by its visible
 * label without reaching into the DOM.
 */
export function fireIonCheckboxChangeFromLabel(element: Element, checked: boolean): void {
  fireEvent(element, new CustomEvent('ionChange', { detail: { checked }, bubbles: true }));
}

/** Fire an ion-input clear, which Ionic reports as a null detail value. */
export function fireIonInputCleared(element: Element): void {
  fireEvent(element, new CustomEvent('ionInput', { detail: { value: null } }));
}
