// Web Worker for offloading markdown-it rendering from the UI thread.
// Mermaid rendering is NOT done here (requires DOM access).

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

let md: MarkdownIt | null = null;

function getParser(): MarkdownIt {
  if (md) return md;
  md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight: (str: string, lang: string) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch { /* fall through */ }
      }
      try {
        return hljs.highlightAuto(str).value;
      } catch {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    },
  });
  return md;
}

self.onmessage = (e: MessageEvent<{ id: number; content: string }>) => {
  const { id, content } = e.data;
  try {
    const parser = getParser();
    const html = parser.render(content);

    // Convert mermaid code blocks to placeholders
    const withPlaceholders = html.replace(
      /<pre><code class="hljs language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      (_match, code: string) => {
        const decoded = code
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');
        const b64 = btoa(unescape(encodeURIComponent(decoded)));
        return `<div class="mermaid-placeholder" data-mermaid="${b64}"></div>`;
      },
    );

    self.postMessage({ id, html: withPlaceholders, error: null });
  } catch (err) {
    self.postMessage({ id, html: '', error: err instanceof Error ? err.message : String(err) });
  }
};
