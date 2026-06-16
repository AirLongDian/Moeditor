let mermaidInitialized = false;

async function ensureMermaid(): Promise<typeof import('mermaid')> {
  const mermaid = await import('mermaid');
  if (!mermaidInitialized) {
    mermaid.default.initialize({
      startOnLoad: false,
      theme: (document.documentElement.classList.contains('dark') ? 'dark' : 'default') as 'default' | 'dark',
      securityLevel: 'sandbox',
      flowchart: { useMaxWidth: true, htmlLabels: true },
      sequence: { useMaxWidth: true },
      gantt: { useMaxWidth: true },
    });
    mermaidInitialized = true;
  }
  return mermaid;
}

// Reset initialization when theme changes
export function resetMermaid(): void {
  mermaidInitialized = false;
}

export async function renderMermaidCharts(container: HTMLElement): Promise<void> {
  const placeholders = container.querySelectorAll<HTMLElement>('[data-mermaid]');
  if (placeholders.length === 0) return;

  try {
    const mermaid = await ensureMermaid();

    for (const placeholder of placeholders) {
      try {
        const b64 = placeholder.getAttribute('data-mermaid') || '';
        const code = decodeURIComponent(escape(atob(b64)));

        const id = 'mermaid-' + Math.random().toString(36).substring(2, 10);
        const { svg } = await mermaid.default.render(id, code);

        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-rendered';
        wrapper.innerHTML = svg;
        placeholder.replaceWith(wrapper);
      } catch (err) {
        // Show error in the placeholder
        placeholder.innerHTML = `<pre style="color: #c00; padding: 12px; background: #fff0f0; border: 1px solid #fcc; border-radius: 4px; font-size: 12px;">Mermaid render error: ${err instanceof Error ? err.message : String(err)}</pre>`;
        placeholder.removeAttribute('data-mermaid');
      }
    }
  } catch (err) {
    console.error('Failed to load Mermaid:', err);
    // Mark all placeholders as failed
    for (const placeholder of placeholders) {
      placeholder.textContent = 'Mermaid library failed to load';
      placeholder.removeAttribute('data-mermaid');
    }
  }
}
