import { BrowserWindow, app as electronApp, Menu } from 'electron';
import path from 'path';
import { EditorWindow } from './window';
import { registerAllHandlers } from './ipc-handlers';
import { buildAppMenu } from './menu';
import { Actions } from './actions';

export class Application {
  windows: EditorWindow[] = [];
  private _newWindow: EditorWindow | null = null;

  get newWindow(): EditorWindow | null { return this._newWindow; }
  set newWindow(w: EditorWindow | null) { this._newWindow = w; }

  async run(): Promise<void> {
    electronApp.setName('Moeditor');

    registerAllHandlers();

    const argv = process.argv.slice(
      process.argv[0]?.endsWith('electron') && process.argv[1] === '.' ? 2 : 1,
    );
    const docs = argv.filter((s) => !s.startsWith('--'));

    if (docs.length === 0) {
      this.open();
    } else {
      for (const doc of docs) {
        const resolved = path.resolve(doc);
        electronApp.addRecentDocument(resolved);
        this.open(resolved);
      }
    }

    if (process.platform === 'darwin') {
      this.registerAppMenu();
    }

    electronApp.on('activate', () => {
      if (this.windows.length === 0) {
        this.open();
      }
    });
  }

  open(fileName?: string): void {
    const win = new EditorWindow(fileName);
    this.windows.push(win);
  }

  private registerAppMenu(): void {
    const menu = buildAppMenu({
      fileNew: () => Actions.openNew(this),
      fileOpen: () => Actions.open(this),
      fileSave: () => Actions.save(),
      fileSaveAs: () => Actions.saveAs(),
      fileExportHTML: () => {
        const w = BrowserWindow.getFocusedWindow();
        w?.webContents.send('action-export-html');
      },
      fileExportPDF: () => {
        const w = BrowserWindow.getFocusedWindow();
        w?.webContents.send('action-export-pdf');
      },
      modeToRead: () => {
        const w = BrowserWindow.getFocusedWindow();
        w?.webContents.send('change-edit-mode', 'read-wide');
      },
      modeToWrite: () => {
        const w = BrowserWindow.getFocusedWindow();
        w?.webContents.send('change-edit-mode', 'write-wide');
      },
      modeToPreview: () => {
        const w = BrowserWindow.getFocusedWindow();
        w?.webContents.send('change-edit-mode', 'preview');
      },
      about: () => {
        const w = BrowserWindow.getFocusedWindow();
        w?.webContents.send('menu-action', 'about');
      },
      settings: () => {
        const w = BrowserWindow.getFocusedWindow();
        w?.webContents.send('menu-action', 'settings');
      },
    });
    Menu.setApplicationMenu(menu);
  }
}
