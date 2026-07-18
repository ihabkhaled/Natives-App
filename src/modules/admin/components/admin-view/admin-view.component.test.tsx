import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminView } from './admin-view.component';

describe('AdminView', () => {
  it('renders the heading as a section heading and the description', () => {
    render(<AdminView heading="Admin console" description="Manage users and roles." />);

    expect(screen.getByRole('heading', { name: 'Admin console' })).toBeInTheDocument();
    expect(screen.getByText('Manage users and roles.')).toBeInTheDocument();
  });
});
