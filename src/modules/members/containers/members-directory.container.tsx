import { MembersDirectoryView } from '../components/members-directory-view';
import { useMembersDirectory } from '../hooks/use-members-directory.hook';

/** Routed member directory screen. */
export function MembersDirectoryContainer(): React.JSX.Element {
  const view = useMembersDirectory();
  return <MembersDirectoryView {...view} />;
}
