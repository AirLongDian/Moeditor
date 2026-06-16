export function initContextMenu(editorView: { dom: HTMLElement }): void {
  editorView.dom.addEventListener('contextmenu', (e: MouseEvent) => {
    // CM6 has built-in context menu support
    // Just prevent default browser menu if we want custom
    // For now, rely on CM6's default which includes cut/copy/paste
    // This is a placeholder for future custom context menu
  });
}
