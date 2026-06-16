interface ConfigSchema {
  locale: string;
  'scale-factor': number;
  'editor-font-size': number;
  'editor-line-height': number;
  'tab-size': number;
  math: boolean;
  'uml-diagrams': boolean;
  'paste-image-path': string;
  'paste-image-folder': string;
}

const defaults: Record<string, unknown> = {
  locale: 'en',
  'scale-factor': 1.0,
  'editor-font-size': 14,
  'editor-line-height': 2,
  'tab-size': 4,
  math: true,
  'uml-diagrams': true,
  'paste-image-path': 'relative',
  'paste-image-folder': '{filename}_files',
};

async function loadConfig(): Promise<void> {
  try {
    const config = await window.moeditorAPI.getAllConfig();
    for (const [key, elId] of Object.entries(idMap)) {
      const el = document.getElementById(elId) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      const value = config[key] ?? defaults[key];
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        el.checked = Boolean(value);
      } else {
        el.value = String(value);
      }
    }
  } catch {
    // Standalone mode - use defaults
    for (const [key, elId] of Object.entries(idMap)) {
      const el = document.getElementById(elId) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      const value = defaults[key];
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        el.checked = Boolean(value);
      } else {
        el.value = String(value);
      }
    }
  }
}

const idMap: Record<string, string> = {
  locale: 'cfg-locale',
  'scale-factor': 'cfg-scale-factor',
  'editor-font-size': 'cfg-editor-font-size',
  'editor-line-height': 'cfg-editor-line-height',
  'tab-size': 'cfg-tab-size',
  math: 'cfg-math',
  'uml-diagrams': 'cfg-uml-diagrams',
  'paste-image-path': 'cfg-paste-image-path',
  'paste-image-folder': 'cfg-paste-image-folder',
};

async function saveSetting(key: string, el: HTMLElement): Promise<void> {
  let value: unknown;
  if (el instanceof HTMLInputElement && el.type === 'checkbox') {
    value = el.checked;
  } else if (el instanceof HTMLInputElement && el.type === 'number') {
    value = parseFloat(el.value);
  } else {
    value = (el as HTMLInputElement).value;
  }
  try {
    await window.moeditorAPI.setConfig(key, value);
  } catch {
    console.warn('Failed to save config:', key);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();

  // Auto-save on change
  for (const [key, elId] of Object.entries(idMap)) {
    const el = document.getElementById(elId);
    if (!el) continue;
    el.addEventListener('change', () => saveSetting(key, el));
  }
});
