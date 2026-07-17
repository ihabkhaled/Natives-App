import { getEnvironment } from '@/packages/environment';
import { API_MODE, type ApiMode } from '@/shared/enums';

export interface ExecutionContext {
  readonly apiMode: ApiMode;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
}

export function getExecutionContext(): ExecutionContext {
  const environment = getEnvironment();
  return {
    apiMode: environment.apiMode === API_MODE.Remote ? API_MODE.Remote : API_MODE.Mock,
    isDevelopment: environment.isDevelopment,
    isProduction: environment.isProduction,
  };
}
