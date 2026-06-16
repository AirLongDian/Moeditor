type SidebarAction = 'new' | 'open' | 'save' | 'save-as' | 'export-as-html' | 'export-as-pdf' | 'settings' | 'about';

interface SidebarItem {
  action: SidebarAction;
  label: string;
  separator?: boolean;
}

const menuItems: SidebarItem[] = [
  { action: 'new', label: 'New' },
  { action: 'open', label: 'Open' },
  { action: 'save', label: 'Save' },
  { action: 'save-as', label: 'Save As' },
  { action: 'export-as-html', label: 'Export as HTML' },
  { action: 'export-as-pdf', label: 'Export as PDF' },
  { action: 'settings', label: 'Settings' },
  { action: 'about', label: 'About' },
];

export class Sidebar {
  private el: HTMLElement;
  private isOpen = false;

  constructor(container: HTMLElement, onAction: (action: SidebarAction) => void) {
    this.el = document.createElement('div');
    this.el.id = 'side-menu';
    this.el.innerHTML = `
      <div class="side-menu-logo">MOEDITOR</div>
      <ul>
        ${menuItems.map((item, i) => `
          ${i === 4 ? '<li class="break"></li>' : ''}
          <li data-action="${item.action}" class="l10n">${item.label}</li>
        `).join('')}
      </ul>
    `;

    this.el.addEventListener('click', (e) => {
      const li = (e.target as HTMLElement).closest('li');
      if (li) {
        const action = li.dataset.action as SidebarAction;
        if (action) {
          onAction(action);
          this.close();
        }
      }
    });

    container.appendChild(this.el);
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    this.isOpen = true;
    this.el.classList.add('open');
  }

  close(): void {
    this.isOpen = false;
    this.el.classList.remove('open');
  }

  get element(): HTMLElement { return this.el; }
  get visible(): boolean { return this.isOpen; }
}
