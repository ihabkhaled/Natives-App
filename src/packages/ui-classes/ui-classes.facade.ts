import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cx(...inputs: readonly ClassValue[]): string {
  return twMerge(clsx(inputs));
}
