export interface AppNavigation {
  readonly push: (path: string) => void;
  readonly replace: (path: string) => void;
  readonly goBack: () => void;
  readonly currentPath: string;
}
