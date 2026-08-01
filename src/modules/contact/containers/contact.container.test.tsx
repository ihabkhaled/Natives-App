import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildContactScreenView } from '../../../../tests/factories/contact-screen-view.factory';

import { useContactScreen } from '../hooks/use-contact-screen.hook';
import { ContactContainer } from './contact.container';

vi.mock('../hooks/use-contact-screen.hook', () => ({ useContactScreen: vi.fn() }));

beforeEach(() => {
  vi.mocked(useContactScreen).mockReturnValue(buildContactScreenView());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContactContainer', () => {
  it('renders the contact page shell', () => {
    render(<ContactContainer />);

    expect(screen.getByTestId(TEST_IDS.contactPage)).toBeInTheDocument();
  });

  it('feeds the view model into the contact view', () => {
    render(<ContactContainer />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Contact Us');
  });
});
