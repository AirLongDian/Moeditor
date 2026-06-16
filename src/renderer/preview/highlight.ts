import hljs from 'highlight.js';

const registeredLangs = new Set<string>();

function ensureLang(lang: string): void {
  if (!lang || registeredLangs.has(lang)) return;
  try {
    // highlight.js 11.x auto-registers common languages from the full bundle
    registeredLangs.add(lang);
  } catch {
    // language not available
  }
}

export function highlightCode(code: string, lang: string): string {
  ensureLang(lang);

  if (lang && hljs.getLanguage(lang)) {
    try {
      const result = hljs.highlight(code, { language: lang });
      return result.value;
    } catch {
      // fall through to auto-detection
    }
  }

  // Auto-detect if no language specified
  try {
    const result = hljs.highlightAuto(code);
    return result.value;
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
