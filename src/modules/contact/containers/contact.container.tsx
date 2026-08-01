import { ContactView } from '../components/contact-view';
import { useContactScreen } from '../hooks/use-contact-screen.hook';

/** Contact Us screen: view model in, presentational component out. */
export function ContactContainer(): React.JSX.Element {
  const screen = useContactScreen();
  return <ContactView {...screen} />;
}
