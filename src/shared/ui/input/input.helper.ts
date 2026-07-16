export function toInputStateClass(hasError: boolean): string {
  return hasError ? 'ion-invalid ion-touched' : '';
}

export function extractIonInputValue(detailValue: string | number | null | undefined): string {
  if (detailValue === null || detailValue === undefined) {
    return '';
  }
  return String(detailValue);
}
