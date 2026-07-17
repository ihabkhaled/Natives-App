/**
 * Application entry. Excluded from coverage as uninstrumentable bootstrap
 * (documented in docs/setup/coverage-policy.md); all wiring it calls lives
 * in testable modules under src/app/startup.
 */
import './app/styles/app.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppShell, startApp } from './app';

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Root container #root is missing in index.html');
}

void startApp().then(() => {
  createRoot(container).render(
    <StrictMode>
      <AppShell />
    </StrictMode>,
  );
});
