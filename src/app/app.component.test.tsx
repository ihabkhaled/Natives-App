import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppComponent } from './app.component';

function queryIonApps(): readonly Element[] {
  return [...document.body.querySelectorAll('ion-app')];
}

describe('AppComponent', () => {
  it('renders its children', () => {
    render(
      <AppComponent>
        <p data-testid="app-child">Body</p>
      </AppComponent>,
    );

    expect(screen.getByTestId('app-child')).toBeInTheDocument();
  });

  it('frames the whole app in a single ion-app root', () => {
    render(
      <AppComponent>
        <p data-testid="app-child">Body</p>
      </AppComponent>,
    );

    const ionApps = queryIonApps();
    expect(ionApps).toHaveLength(1);
    expect(ionApps[0]).toContainElement(screen.getByTestId('app-child'));
  });

  it('renders every child it is given', () => {
    render(
      <AppComponent>
        <p data-testid="first">One</p>
        <p data-testid="second">Two</p>
      </AppComponent>,
    );

    expect(screen.getByTestId('first')).toBeInTheDocument();
    expect(screen.getByTestId('second')).toBeInTheDocument();
  });
});
