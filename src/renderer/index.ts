import './style.css';
import { createEditor } from './editor/setup';
import { renderMarkdownAsync, hasMermaidCharts } from './preview/renderer';
import { renderMermaidCharts } from './preview/mermaid';

document.addEventListener('DOMContentLoaded', async () => {
  // ===== DOM refs (matching original Moeditor structure) =====
  const mainEl = document.getElementById('main')!;
  const sideMenu = document.getElementById('side-menu')!;
  const sideMenuCover = document.getElementById('side-menu-cover')!;
  const editorDiv = document.getElementById('editor')!;
  const container = document.getElementById('container')!;
  const containerWrapper = document.getElementById('container-wrapper')!;
  const settingsOverlay = document.getElementById('settings-overlay')!;
  const settingsBody = document.getElementById('settings-body')!;
  const settingsClose = document.getElementById('settings-close')!;
  const popupMode = document.getElementById('popup-menu-mode')!;
  const btnMenu = document.getElementById('button-bottom-menu')!;
  const btnFocus = document.getElementById('button-bottom-focus')!;
  const btnMode = document.getElementById('button-bottom-mode')!;

  let currentFilePath: string | undefined;
  let currentMode = 'preview';

  // ===== Preview debounce =====
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const updatePreview = (content: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const html = await renderMarkdownAsync(content);
      container.innerHTML = html;
      if (hasMermaidCharts(html)) {
        try {
          const umlEnabled = await window.moeditorAPI.getConfig('uml-diagrams');
          if (umlEnabled !== false) renderMermaidCharts(container);
        } catch {
          renderMermaidCharts(container); // default: enabled
        }
      }
    }, 200);
  };

  // ===== Sidebar =====
  const openSidebar = () => {
    sideMenu.style.marginLeft = '0';
    sideMenuCover.style.opacity = '1';
    sideMenuCover.style.pointerEvents = 'auto';
  };
  const closeSidebar = () => {
    sideMenu.style.marginLeft = '-300px';
    sideMenuCover.style.opacity = '0';
    sideMenuCover.style.pointerEvents = 'none';
  };
  sideMenuCover.addEventListener('click', closeSidebar);
  btnMenu.addEventListener('click', () => {
    if (sideMenu.style.marginLeft === '0px') closeSidebar();
    else openSidebar();
  });

  // Sidebar action clicks
  const handleSidebarAction = async (action: string) => {
    closeSidebar();
    const content = editor.getContent();
    switch (action) {
      case 'new':
        editor.setContent('');
        currentFilePath = undefined;
        updatePreview('');
        break;
      case 'save':
        if (currentFilePath) {
          await window.moeditorAPI.saveFile(currentFilePath, content);
        } else {
          const f = await window.moeditorAPI.openFileDialog();
          if (f) { currentFilePath = f.path; await window.moeditorAPI.saveFile(f.path, content); }
        }
        break;
      case 'open': {
        const f = await window.moeditorAPI.openFileDialog();
        if (f) { currentFilePath = f.path; editor.setContent(f.content); updatePreview(f.content); }
        break;
      }
      case 'save-as': {
        const f = await window.moeditorAPI.openFileDialog();
        if (f) { currentFilePath = f.path; await window.moeditorAPI.saveFile(f.path, content); }
        break;
      }
      case 'export-as-html': {
        const { exportHTML } = await import('./export/exporter');
        const html = await exportHTML(content, '');
        await window.moeditorAPI.exportHTML(html);
        break;
      }
      case 'export-as-pdf': {
        const { exportPDFHTML } = await import('./export/exporter');
        const html = await exportPDFHTML(content);
        await window.moeditorAPI.exportPDF(html);
        break;
      }
      case 'settings':
        openSettings(); break;
      case 'about':
        openSettings(); break;
    }
  };
  sideMenu.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest('li');
    if (li && li.dataset.action) handleSidebarAction(li.dataset.action);
  });

  // ===== Mode switching (mirrors original moe-mode.js behavior) =====
  const setMode = (mode: string) => {
    currentMode = mode;
    mainEl.classList.remove('read-mode', 'write-mode',
      'read-mode-thin', 'read-mode-medium', 'read-mode-wide',
      'write-mode-thin', 'write-mode-medium', 'write-mode-wide');
    if (mode.startsWith('read')) {
      mainEl.classList.add('read-mode');
    } else if (mode.startsWith('write')) {
      mainEl.classList.add('write-mode');
    }
    // Add width variant
    if (mode.includes('-thin')) mainEl.classList.add(mode.replace('read-', 'read-mode-').replace('write-', 'write-mode-'));
    else if (mode.includes('-medium')) mainEl.classList.add(mode.replace('read-', 'read-mode-').replace('write-', 'write-mode-'));
    else if (mode.includes('-wide')) mainEl.classList.add(mode.replace('read-', 'read-mode-').replace('write-', 'write-mode-'));
  };

  // ===== Mode popup (bottom bar button) =====
  const showModePopup = (e: MouseEvent) => {
    e.stopPropagation();
    const rect = btnMode.getBoundingClientRect();
    popupMode.style.display = 'block';
    popupMode.style.top = (window.innerHeight - (window.innerHeight - rect.top) - popupMode.offsetHeight) + 'px';
    popupMode.style.left = (rect.right - 232) + 'px';
  };
  btnMode.addEventListener('click', showModePopup);
  popupMode.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest('li');
    if (!li?.dataset.name) return;
    setMode(li.dataset.name);
    popupMode.style.display = 'none';
  });
  document.addEventListener('click', () => {
    popupMode.style.display = 'none';
  });

  // ===== Focus mode =====
  btnFocus.addEventListener('click', () => {
    editorDiv.classList.toggle('focus');
  });

  // ===== Apply editor settings =====
  const getCmContent = () => editorDiv.querySelector('.cm-content') as HTMLElement | null;

  const applyEditorFont = (font: string) => {
    document.body.setAttribute('settings-editor-font', font || 'default');
    const fontMap: Record<string, string> = {
      default: "'Roboto Mono', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
      'Maple Mono NF CN': "'Maple Mono NF CN', 'Roboto Mono', monospace",
      monospace: 'monospace',
      serif: 'serif',
      sans: 'sans-serif',
    };
    const editorFont = fontMap[font] || fontMap.default;
    const previewFont = font === 'Maple Mono NF CN'
      ? "'Maple Mono NF CN', Roboto, Helvetica, 'Segoe UI', Arial, sans-serif"
      : "Roboto, Helvetica, 'Segoe UI', Arial, sans-serif";
    const el = getCmContent();
    if (el) el.style.fontFamily = editorFont;
    container.style.fontFamily = previewFont;
  };

  const applyFontSize = (size: string) => {
    const px = (parseInt(size) || 14) + 'px';
    const el = getCmContent();
    if (el) el.style.fontSize = px;
    container.style.fontSize = px;
  };

  const applyLineHeight = (lh: string) => {
    const lineHeight = String(parseFloat(lh) || 2);
    const el = getCmContent();
    if (el) el.style.lineHeight = lineHeight;
    container.style.lineHeight = lineHeight;
  };

  const applyTabSize = (ts: string) => {
    const n = parseInt(ts) || 4;
    const el = getCmContent();
    if (el) {
      el.style.tabSize = String(n);
      el.style.MozTabSize = String(n);
    }
  };

  const applyMath = (_enabled: boolean) => {
    import('./preview/renderer').then(m => m.resetParser());
    updatePreview(editor.getContent());
  };

  const applySettings = async () => {
    try {
      const font = await window.moeditorAPI.getConfig('editor-font');
      const fontSize = await window.moeditorAPI.getConfig('editor-font-size');
      const lineHeight = await window.moeditorAPI.getConfig('editor-line-height');
      const tabSize = await window.moeditorAPI.getConfig('tab-size');
      applyEditorFont((font as string) || 'default');
      applyFontSize(String(fontSize || '14'));
      applyLineHeight(String(lineHeight || '2'));
      applyTabSize(String(tabSize || '4'));
    } catch { /* */ }
  };

  // ===== Settings overlay =====
  const openSettings = async () => {
    const fields: Array<{ key: string; label: string; type: string; options?: string[] }> = [
      { key: 'editor-font', label: 'Editor Font', type: 'select', options: ['default', 'Maple Mono NF CN', 'monospace', 'serif', 'sans'] },
      { key: 'editor-font-size', label: 'Font Size', type: 'number' },
      { key: 'editor-line-height', label: 'Line Height', type: 'number' },
      { key: 'tab-size', label: 'Tab Size', type: 'number' },
      { key: 'math', label: 'Math (KaTeX)', type: 'checkbox' },
      { key: 'uml-diagrams', label: 'UML Diagrams', type: 'checkbox' },
      { key: 'paste-image-folder', label: 'Image Folder', type: 'text' },
    ];
    let html = '<div style="font-size:11px;color:#999;margin-bottom:12px;padding-left:2px;">Use <code>{filename}</code> as placeholder for the current .md file name.<br>Example: <code>assets/{filename}</code> &rarr; saves to <code>assets/&lt;file&gt;/</code> folder</div>';
    for (const f of fields) {
      let val: unknown = '';
      try { val = await window.moeditorAPI.getConfig(f.key); } catch { /* */ }
      if (f.type === 'checkbox') {
        html += `<div class="row"><label>${f.label}</label><input type="checkbox" id="cfg-${f.key}"${val ? ' checked' : ''} /></div>`;
      } else if (f.type === 'select') {
        html += `<div class="row"><label>${f.label}</label><select id="cfg-${f.key}">${(f.options || []).map(o => `<option value="${o}"${val === o ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
      } else if (f.type === 'number') {
        html += `<div class="row"><label>${f.label}</label><input type="number" id="cfg-${f.key}" value="${val || ''}" style="width:70px" /></div>`;
      } else {
        html += `<div class="row"><label>${f.label}</label><input type="text" id="cfg-${f.key}" value="${val || ''}" /></div>`;
      }
    }
    html += '<div style="text-align:center;color:#999;font-size:11px;margin-top:16px;padding-bottom:8px;">Moeditor v2.0.0</div>';
    settingsBody.innerHTML = html;
    settingsOverlay.classList.remove('hidden');

    settingsBody.addEventListener('change', async (e) => {
      const el = e.target as HTMLInputElement | HTMLSelectElement;
      if (!el.id.startsWith('cfg-')) return;
      const key = el.id.replace('cfg-', '');
      const value = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.checked : el.value;
      try { await window.moeditorAPI.setConfig(key, value); } catch { /* */ }
      // Apply settings immediately
      if (key === 'editor-font') applyEditorFont(value as string);
      if (key === 'editor-font-size') applyFontSize(value as string);
      if (key === 'editor-line-height') applyLineHeight(value as string);
      if (key === 'tab-size') applyTabSize(value as string);
      if (key === 'math') applyMath(value as boolean);
    });
  };
  const closeSettings = () => settingsOverlay.classList.add('hidden');
  settingsClose.addEventListener('click', closeSettings);
  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) closeSettings();
  });

  // ===== IPC listeners =====
  const onMsg = window.moeditorAPI.onMessage;
  onMsg('init-data', (data: unknown) => {
    const d = data as { fileName: string; content: string; directory: string };
    if (d.fileName) currentFilePath = d.fileName;
    if (d.content) { editor.setContent(d.content); updatePreview(d.content); }
  });
  onMsg('change-edit-mode', (mode: unknown) => { setMode(mode as string); });
  onMsg('trigger-save', async () => {
    const c = editor.getContent();
    if (currentFilePath) await window.moeditorAPI.saveFile(currentFilePath, c);
    else {
      const f = await window.moeditorAPI.openFileDialog();
      if (f) { currentFilePath = f.path; await window.moeditorAPI.saveFile(f.path, c); }
    }
  });
  onMsg('action-export-html', async () => {
    const { exportHTML } = await import('./export/exporter');
    await window.moeditorAPI.exportHTML(await exportHTML(editor.getContent(), ''));
  });
  onMsg('action-export-pdf', async () => {
    const { exportPDFHTML } = await import('./export/exporter');
    await window.moeditorAPI.exportPDF(await exportPDFHTML(editor.getContent()));
  });
  onMsg('menu-action', (action: unknown) => {
    if (action === 'settings') openSettings();
  });

  // ===== Initialize editor (CM6 mounted into #editor div) =====
  const editor = createEditor({
    parent: editorDiv,
    initialContent: '# Welcome to Moeditor\n\nStart typing **Markdown** here...\n\n## Features\n\n- GitHub Flavored Markdown\n- TeX math: $E = mc^2$\n- Code highlighting\n- Read / Write / Preview mode\n',
    onChange: (content) => updatePreview(content),
    currentFilePath,
  });
  editor.view.focus();
  updatePreview(editor.getContent());

  // Apply saved editor settings
  applySettings();

  // Remove notransition after first render
  setTimeout(() => mainEl.classList.remove('notransition'), 100);
});
