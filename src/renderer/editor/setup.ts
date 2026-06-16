import { EditorView, ViewUpdate } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { editorExtensions } from './extensions';
import { imagePastePlugin, type ImagePasteContext } from './image-paste-plugin';

export interface EditorInstance {
  view: EditorView;
  getContent: () => string;
  setContent: (content: string) => void;
}

export interface EditorOptions {
  parent: HTMLElement;
  initialContent?: string;
  theme?: string;
  onChange?: (content: string) => void;
  /** Current file path, used by image paste for resolving asset directory */
  currentFilePath?: string;
}

export function createEditor(options: EditorOptions): EditorInstance {
  const { parent, initialContent = '', theme = 'light', onChange, currentFilePath } = options;

  const exts: Extension[] = [...editorExtensions(theme)];

  if (onChange) {
    exts.push(
      EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
    );
  }

  // Image paste plugin
  const pasteCtx: ImagePasteContext = {
    getCurrentFilePath: () => currentFilePath,
  };
  exts.push(imagePastePlugin(pasteCtx));

  const state = EditorState.create({
    doc: initialContent,
    extensions: exts,
  });

  const view = new EditorView({ state, parent });

  return {
    view,
    getContent: () => view.state.doc.toString(),
    setContent: (content: string) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      });
    },
  };
}
