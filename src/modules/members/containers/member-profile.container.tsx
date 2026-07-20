import { MemberProfileView } from '../components/member-profile-view';
import { useMemberProfile } from '../hooks/use-member-profile.hook';

/** Routed member profile screen. */
export function MemberProfileContainer(): React.JSX.Element {
  const view = useMemberProfile();
  return <MemberProfileView {...view} />;
}
