import { BrowserWindow, dialog, app } from 'electron';
import path from 'path';
import fs from 'fs';

const isDev = !app.isPackaged;

export class EditorWindow {
  window: BrowserWindow;
  fileName: string;
  directory: string;
  fileContent: string;
  content: string;
  changed: boolean;

  constructor(filePath?: string) {
    if (filePath && (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
      this.directory = filePath;
      this.fileName = '';
      this.fileContent = this.content = '';
    } else if (filePath) {
      this.directory = path.dirname(filePath);
      this.fileName = filePath;
      try {
        this.fileContent = this.content = fs.readFileSync(filePath, 'utf-8');
      } catch {
        this.fileContent = this.content = '';
      }
    } else {
      this.directory = process.cwd();
      this.fileName = '';
      this.fileContent = this.content = '';
    }

    this.changed = false;

    const conf: Electron.BrowserWindowConstructorOptions = {
      width: 1000,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        zoomFactor: 1.0,
      },
      show: true,
    };

    if (process.platform === 'darwin') {
      conf.titleBarStyle = 'hiddenInset';
    }

    this.window = new BrowserWindow(conf);

    this.registerEvents();

    if (isDev) {
      this.window.loadURL('http://localhost:5173');
    } else {
      this.window.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Pass initial data to renderer once it's loaded
    this.window.webContents.on('did-finish-load', () => {
      this.window.webContents.send('init-data', {
        fileName: this.fileName,
        content: this.content,
        directory: this.directory,
      });
    });
  }

  private registerEvents(): void {
    this.window.on('close', (e) => {
      if (this.changed) {
        const choice = dialog.showMessageBoxSync(this.window, {
          type: 'question',
          buttons: ['Yes', 'No', 'Cancel'],
          title: 'Confirm',
          message: 'Save changes to file?',
        });

        if (choice === 0) {
          this.save();
        } else if (choice === 2) {
          e.preventDefault();
        }
      }
    });
  }

  save(): boolean {
    if (!this.fileName) return false;
    try {
      fs.writeFileSync(this.fileName, this.content, 'utf-8');
      this.fileContent = this.content;
      this.changed = false;
      this.window.setDocumentEdited(false);
      this.window.setRepresentedFilename(this.fileName);
      return true;
    } catch {
      return false;
    }
  }
}
