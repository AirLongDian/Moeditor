export type EditMode =
  | 'read-wide' | 'read-medium' | 'read-narrow'
  | 'write-wide' | 'write-medium' | 'write-narrow'
  | 'preview';

export type ModeCategory = 'read' | 'write' | 'preview';

export function getModeCategory(mode: EditMode): ModeCategory {
  if (mode.startsWith('read')) return 'read';
  if (mode.startsWith('write')) return 'write';
  return 'preview';
}

export class ModeManager {
  private _mode: EditMode = 'preview';
  private listeners: Array<(mode: EditMode) => void> = [];
  private leftPanel!: HTMLElement;
  private rightPanel!: HTMLElement;
  private editorContainer!: HTMLElement;
  private previewContainer!: HTMLElement;

  get mode(): EditMode {
    return this._mode;
  }

  init(
    leftPanel: HTMLElement,
    rightPanel: HTMLElement,
    editorContainer: HTMLElement,
    previewContainer: HTMLElement,
  ): void {
    this.leftPanel = leftPanel;
    this.rightPanel = rightPanel;
    this.editorContainer = editorContainer;
    this.previewContainer = previewContainer;
    this.applyMode(this._mode);
  }

  setMode(mode: EditMode): void {
    if (this._mode === mode) return;
    this._mode = mode;
    this.applyMode(mode);
    for (const listener of this.listeners) {
      listener(mode);
    }
  }

  onChange(callback: (mode: EditMode) => void): void {
    this.listeners.push(callback);
  }

  private applyMode(mode: EditMode): void {
    const category = getModeCategory(mode);

    if (category === 'write') {
      this.editorContainer.style.display = '';
      this.previewContainer.style.display = 'none';
      this.leftPanel.style.flex = '1';
      this.rightPanel.style.display = 'none';
    } else if (category === 'read') {
      this.editorContainer.style.display = 'none';
      this.previewContainer.style.display = '';
      this.leftPanel.style.display = 'none';
      this.rightPanel.style.flex = '1';
    } else {
      // preview mode: split view
      this.editorContainer.style.display = '';
      this.previewContainer.style.display = '';
      this.leftPanel.style.display = '';
      this.rightPanel.style.display = '';
      this.leftPanel.style.flex = '1';
      this.rightPanel.style.flex = '1';
    }
  }
}

// Singleton
export const modeManager = new ModeManager();
