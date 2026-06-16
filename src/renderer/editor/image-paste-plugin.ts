import { ViewPlugin, EditorView } from '@codemirror/view';

export interface ImagePasteContext {
  getCurrentFilePath: () => string | undefined;
}

class ImagePasteHandler {
  private ctx: ImagePasteContext;

  constructor(view: EditorView) {
    this.ctx = {} as ImagePasteContext;
    // ctx will be set by the plugin factory
  }

  setContext(ctx: ImagePasteContext): void {
    this.ctx = ctx;
  }
}

export const imagePastePlugin = (ctx: ImagePasteContext) =>
  ViewPlugin.define(
    (view) => new ImagePasteHandler(view),
    {
      eventHandlers: {
        paste(event: ClipboardEvent, view: EditorView) {
          const items = event.clipboardData?.items;
          if (!items) return false;

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
              event.preventDefault();

              const filePath = ctx.getCurrentFilePath();
              if (!filePath) {
                window.moeditorAPI.showMessageBox({
                  type: 'warning',
                  title: 'Cannot Paste Image',
                  message: 'Please save the document first before pasting images.',
                  buttons: ['OK'],
                });
                return true;
              }

              const blob = item.getAsFile();
              if (!blob) return true;

              const reader = new FileReader();
              reader.onload = async () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                try {
                  const result = await window.moeditorAPI.pasteImage(
                    filePath,
                    arrayBuffer,
                  );
                  if (result.success && result.relativePath) {
                    const mdImage = `![image](${result.relativePath})`;
                    const pos = view.state.selection.main.head;
                    view.dispatch({
                      changes: { from: pos, to: pos, insert: mdImage },
                      selection: {
                        anchor: pos + mdImage.length,
                        head: pos + mdImage.length,
                      },
                    });
                  }
                } catch (e) {
                  console.error('Image paste failed:', e);
                }
              };
              reader.readAsArrayBuffer(blob);
              return true;
            }
          }
          return false;
        },
      },
    },
  );
