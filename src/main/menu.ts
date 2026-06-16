import { Menu, shell, BrowserWindow } from 'electron';

export interface MenuCallbacks {
  fileNew: () => void;
  fileOpen: () => void;
  fileSave: () => void;
  fileSaveAs: () => void;
  fileExportHTML: () => void;
  fileExportPDF: () => void;
  modeToRead: () => void;
  modeToWrite: () => void;
  modeToPreview: () => void;
  about: () => void;
  settings: () => void;
}

export function buildAppMenu(cb: MenuCallbacks): Menu {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: 'Moeditor',
      submenu: [
        { label: 'About Moeditor', click: cb.about },
        { type: 'separator' as const },
        { label: 'Preferences...', accelerator: 'Command+,', click: cb.settings },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { label: 'Hide Moeditor', role: 'hide' as const },
        { label: 'Hide Others', role: 'hideOthers' as const },
        { label: 'Show All', role: 'unhide' as const },
        { type: 'separator' as const },
        { label: 'Quit Moeditor', role: 'quit' as const },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: cb.fileNew },
        { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: cb.fileOpen },
        { type: 'separator' as const },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: cb.fileSave },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: cb.fileSaveAs },
        { type: 'separator' as const },
        {
          label: 'Export',
          submenu: [
            { label: 'HTML...', accelerator: 'CmdOrCtrl+Alt+E', click: cb.fileExportHTML },
            { label: 'PDF...', accelerator: 'CmdOrCtrl+Alt+P', click: cb.fileExportPDF },
          ],
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'delete' as const },
        { role: 'selectAll' as const },
        { type: 'separator' as const },
        {
          label: 'Mode',
          submenu: [
            { label: 'Read Mode', accelerator: 'CmdOrCtrl+Alt+R', click: cb.modeToRead },
            { label: 'Write Mode', accelerator: 'CmdOrCtrl+Alt+G', click: cb.modeToWrite },
            { label: 'Preview Mode', click: cb.modeToPreview },
          ],
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' as const },
        { label: 'Toggle Developer Tools', accelerator: isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: (_item, win) => (win as BrowserWindow)?.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        { role: 'close' as const },
        { role: 'minimize' as const },
        { role: 'zoom' as const },
      ],
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        { label: 'Moeditor on GitHub',
          click: () => { shell.openExternal('https://github.com/Moeditor/Moeditor'); } },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
