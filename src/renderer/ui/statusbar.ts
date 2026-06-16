import { modeManager, type EditMode } from '../mode/mode-manager';

export class StatusBar {
  private el: HTMLElement;
  private leftEl: HTMLElement;
  private rightEl: HTMLElement;
  private modeButtons: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'cover-bottom';
    this.el.innerHTML = `
      <div id="status-left">Moeditor v2</div>
      <div id="mode-buttons">
        <button data-mode="write-wide">Write</button>
        <button data-mode="read-wide">Read</button>
        <button data-mode="preview" class="active">Preview</button>
      </div>
      <div id="status-right">Ready</div>
    `;

    this.leftEl = this.el.querySelector('#status-left')!;
    this.rightEl = this.el.querySelector('#status-right')!;
    this.modeButtons = this.el.querySelector('#mode-buttons')!;

    this.modeButtons.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;
      const mode = btn.dataset.mode as EditMode;
      if (!mode) return;
      this.setActiveModeButton(mode);
      modeManager.setMode(mode);
    });

    container.appendChild(this.el);
  }

  setLeft(text: string): void {
    this.leftEl.textContent = text;
  }

  setRight(text: string): void {
    this.rightEl.textContent = text;
  }

  setActiveModeButton(mode: EditMode): void {
    this.modeButtons.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });
  }

  get element(): HTMLElement { return this.el; }
}
