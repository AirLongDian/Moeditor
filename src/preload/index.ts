import { contextBridge, ipcRenderer } from 'electron';

const allowedChannels = [
  'setting-changed', 'action-export-html', 'action-export-pdf',
  'change-edit-mode', 'set-title', 'menu-action', 'init-data',
  'trigger-save',
];

const api = {
  getConfig: (key: string): Promise<unknown> =>
    ipcRenderer.invoke('app:getConfig', key),

  setConfig: (key: string, value: unknown): Promise<void> =>
    ipcRenderer.invoke('app:setConfig', key, value),

  getAllConfig: (): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('app:getAllConfig'),

  onMessage: (channel: string, callback: (...args: unknown[]) => void): void => {
    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },

  saveFile: (filePath: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('file:save', filePath, content),

  openFileDialog: (): Promise<{ path: string; content: string } | null> =>
    ipcRenderer.invoke('file:openDialog'),

  pasteImage: (filePath: string, imageData: ArrayBuffer): Promise<{ success: boolean; relativePath: string }> =>
    ipcRenderer.invoke('image:paste', { filePath, imageData }),

  showMessageBox: (options: { type: string; title: string; message: string; buttons: string[] }): Promise<number> =>
    ipcRenderer.invoke('dialog:messageBox', options),

  getAppPath: (): Promise<string> =>
    ipcRenderer.invoke('app:getPath'),

  exportHTML: (html: string): Promise<{ success: boolean; filePath?: string; error?: string }> =>
    ipcRenderer.invoke('export:html', html),

  exportPDF: (html: string): Promise<{ success: boolean; filePath?: string; error?: string }> =>
    ipcRenderer.invoke('export:pdf', html),

  signalReady: (): void => ipcRenderer.send('renderer-ready'),
};

contextBridge.exposeInMainWorld('moeditorAPI', api);

export type MoeditorAPI = typeof api;
