import { MyAttendanceView } from '../components/my-attendance-view';
import { useMyAttendanceScreen } from '../hooks/use-my-attendance-screen.hook';

/** The member self-attendance screen. */
export function MyAttendanceContainer(): React.JSX.Element {
  const view = useMyAttendanceScreen();
  return <MyAttendanceView {...view} />;
}
