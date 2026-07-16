import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportError } from '@/packages/error-reporting';
import { translateNow } from '@/packages/i18n';
import { getPlatformLogger, reloadApplication } from '@/platform';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';
import { ErrorState } from '@/shared/ui';

export interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  readonly hasError: boolean;
}

/**
 * Last-resort UI boundary. Renders a sanitized error state (never the raw
 * error), reports the failure, and offers a full reload.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public override state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, { componentStack: errorInfo.componentStack ?? '' });
    getPlatformLogger('error-boundary').error('Unhandled render error', {
      name: error.name,
    });
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={translateNow(I18N_KEYS.states.errorTitle)}
          message={translateNow(I18N_KEYS.errors.unexpected)}
          retryLabel={translateNow(I18N_KEYS.common.retry)}
          onRetry={reloadApplication}
          testId={TEST_IDS.errorBoundaryFallback}
        />
      );
    }
    return this.props.children;
  }
}
