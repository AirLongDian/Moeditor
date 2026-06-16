import { ipcMain, dialog, app, BrowserWindow, shell } from 'electron';
import { handleImagePaste } from './image-paste';
import fs from 'fs';
import os from 'os';
import path from 'path';

const defaultConfig: Record<string, unknown> = {
  locale: 'default',
  debug: false,
  'scale-factor': 1.0,
  'tab-size': 4,
  'edit-mode': 'preview',
  'edit-mode-read': 'read-mode-wide',
  'edit-mode-write': 'write-mode-wide',
  'focus-mode': false,
  'editor-font': 'default',
  'editor-theme': 'one-dark',
  'editor-font-size': 14,
  'editor-line-height': 2,
  math: true,
  'uml-diagrams': true,
  'auto-reload': 'auto',
  'auto-save': 'disabled',
  'highlight-theme': 'github',
  'render-theme': 'GitHub',
  'custom-render-themes': {},
  'custom-csss': {},
  theme: 'light',
  'paste-image-path': 'relative',
  'paste-image-folder': '{filename}_files',
};

const configStore: Map<string, unknown> = new Map(Object.entries(defaultConfig));

export function registerAllHandlers(): void {
  ipcMain.handle('app:getConfig', (_event, key: string) => {
    return configStore.get(key) ?? defaultConfig[key] ?? null;
  });

  ipcMain.handle('app:setConfig', (_event, key: string, value: unknown) => {
    configStore.set(key, value);
  });

  ipcMain.handle('app:getAllConfig', () => {
    return Object.fromEntries(configStore);
  });

  ipcMain.handle('app:getPath', () => {
    return app.getAppPath();
  });

  // Image paste handler
  ipcMain.handle('image:paste', async (_event, { filePath, imageData }: { filePath: string; imageData: number[] }) => {
    const buffer = Buffer.from(imageData);
    const folderTemplate = String(configStore.get('paste-image-folder') || '{filename}_files');
    return handleImagePaste(filePath, buffer, folderTemplate);
  });

  // File save handler
  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    } catch {
      return false;
    }
  });

  // File open dialog
  ipcMain.handle('file:openDialog', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown Documents', extensions: ['md', 'mkd', 'markdown'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) return null;

    const filePath = result.filePaths[0];
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { path: filePath, content };
    } catch {
      return null;
    }
  });

  // Dialog message box
  ipcMain.handle('dialog:messageBox', async (_event, options: { type: string; title: string; message: string; buttons: string[] }) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return -1;

    const result = await dialog.showMessageBox(win, {
      type: options.type as 'warning' | 'info' | 'error' | 'question',
      title: options.title,
      message: options.message,
      buttons: options.buttons,
    });
    return result.response;
  });

  // Export HTML
  ipcMain.handle('export:html', async (_event, htmlContent: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { success: false, error: 'No window' };

    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: 'HTML Documents', extensions: ['html', 'htm'] }],
    });

    if (result.canceled || !result.filePath) return { success: false };

    try {
      fs.writeFileSync(result.filePath, htmlContent, 'utf-8');
      return { success: true, filePath: result.filePath };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  });

  // Export PDF
  ipcMain.handle('export:pdf', async (_event, htmlContent: string) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { success: false, error: 'No window' };

    const result = await dialog.showSaveDialog(win, {
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
    });

    if (result.canceled || !result.filePath) return { success: false };

    // Create hidden window for PDF rendering
    const pdfWin = new BrowserWindow({ show: false });
    const tmpFile = path.join(os.tmpdir(), `moeditor-pdf-${Date.now()}.html`);

    try {
      fs.writeFileSync(tmpFile, htmlContent, 'utf-8');
      await pdfWin.loadFile(tmpFile);

      // Wait for rendering
      await new Promise<void>((resolve) => {
        ipcMain.once('ready-export-pdf', () => {
          setTimeout(() => resolve(), 500);
        });
      });

      const pdfBuffer = await pdfWin.webContents.printToPDF({ printBackground: true });
      fs.writeFileSync(result.filePath, pdfBuffer);
      pdfWin.destroy();
      fs.unlinkSync(tmpFile);
      return { success: true, filePath: result.filePath };
    } catch (e) {
      pdfWin.destroy();
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
      return { success: false, error: String(e) };
    }
  });
}
