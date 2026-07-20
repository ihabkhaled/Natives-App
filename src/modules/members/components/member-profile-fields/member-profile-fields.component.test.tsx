import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MemberProfileFields } from './member-profile-fields.component';

const fields = [
  { key: 'fullName', label: 'Full name', value: 'Omar Hassan' },
  { key: 'email', label: 'Email', value: 'o@x.com' },
];

describe('MemberProfileFields', () => {
  it('renders a restricted notice and field rows', () => {
    render(
      <MemberProfileFields
        heading="Profile"
        restrictedNotice="Some fields hidden"
        fields={fields}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.memberProfileFields)).toBeInTheDocument();
    expect(screen.getByText('Some fields hidden')).toBeInTheDocument();
    expect(screen.getByText('Omar Hassan')).toBeInTheDocument();
  });

  it('omits the notice when unrestricted', () => {
    render(<MemberProfileFields heading="Profile" restrictedNotice={null} fields={fields} />);
    expect(screen.queryByText('Some fields hidden')).not.toBeInTheDocument();
  });
});
