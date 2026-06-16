interface MoeditorAPI {
  getConfig: (key: string) => Promise<unknown>;
  setConfig: (key: string, value: unknown) => Promise<void>;
  getAllConfig: () => Promise<Record<string, unknown>>;
  onMessage: (channel: string, callback: (...args: unknown[]) => void) => void;
  saveFile: (filePath: string, content: string) => Promise<boolean>;
  openFileDialog: () => Promise<{ path: string; content: string } | null>;
  pasteImage: (filePath: string, imageData: ArrayBuffer) => Promise<{ success: boolean; relativePath: string }>;
  showMessageBox: (options: { type: string; title: string; message: string; buttons: string[] }) => Promise<number>;
  getAppPath: () => Promise<string>;
  exportHTML: (html: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  exportPDF: (html: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  signalReady: () => void;
}

declare global {
  interface Window {
    moeditorAPI: MoeditorAPI;
  }
}

export {};
