import { dialog, BrowserWindow, app as electronApp } from 'electron';
import fs from 'fs';
import { EditorWindow } from './window';
import type { Application } from './app';

export class Actions {
  static openNew(app: Application): void {
    app.open();
  }

  static async open(app: Application): Promise<void> {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown Documents', extensions: ['md', 'mkd', 'markdown'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled) return;

    for (const file of result.filePaths) {
      electronApp.addRecentDocument(file);
      app.open(file);
    }
  }

  static save(): boolean {
    const w = BrowserWindow.getFocusedWindow();
    if (!w) return false;

    w.webContents.send('trigger-save');
    return true;
  }

  static saveAs(): boolean {
    const w = BrowserWindow.getFocusedWindow();
    if (!w) return false;

    w.webContents.send('trigger-save-as');
    return true;
  }
}
