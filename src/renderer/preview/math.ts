import katex from 'katex';

const cache = new Map<string, string>();

export function renderMath(str: string, displayMode: boolean): string {
  const cacheKey = (displayMode ? 'd' : 'i') + str;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const html = katex.renderToString(str, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
    cache.set(cacheKey, html);
    return html;
  } catch {
    return `<span class="katex-error">${str}</span>`;
  }
}

export function renderAllMath(rootEl: HTMLElement): void {
  // Render block math: $$...$$
  const blockPattern = /\$\$([\s\S]*?)\$\$/g;
  rootEl.innerHTML = rootEl.innerHTML.replace(blockPattern, (_match, tex) => {
    return renderMath(tex.trim(), true);
  });

  // Render inline math: $...$
  const inlinePattern = /\$(.+?)\$/g;
  rootEl.innerHTML = rootEl.innerHTML.replace(inlinePattern, (_match, tex) => {
    return renderMath(tex.trim(), false);
  });
}
