import { BrandLogo, PageShell } from '@/shared/ui';

import type { AuthPanelProps } from './auth-panel.types';

/** Branded, immersive shell for the signed-out auth screens. */
export function AuthPanel(props: AuthPanelProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={props.testId} immersive>
      <main className="app-auth-layout">
        <div className="app-welcome-hero__mark" aria-hidden="true" />
        <section className="app-auth-panel" aria-labelledby={props.headingId}>
          <header className="app-auth-panel__header">
            <BrandLogo label={props.logoLabel} size="lg" />
            <h1 id={props.headingId} className="m-0 text-3xl font-bold">
              {props.title}
            </h1>
          </header>
          {props.children}
        </section>
      </main>
    </PageShell>
  );
}
