import { NewsEditorView } from '../components/news-editor-view';
import { useNewsEditor } from '../hooks/use-news-editor.hook';

/** Permissioned newsroom: view model in, presentational component out. */
export function NewsEditorContainer(): React.JSX.Element {
  const screen = useNewsEditor();
  return <NewsEditorView {...screen} />;
}
