/** What every data-quality command reports back to the screen. */
export interface DataQualityMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}
