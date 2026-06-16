import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import { highlightCode } from './highlight';
import katex from 'katex';

let md: MarkdownIt | null = null;

function getParser(breaks = false): MarkdownIt {
  // Reuse singleton, only recreate when options change
  if (md) return md;

  md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks,
    highlight: (str: string, lang: string) => {
      const highlighted = highlightCode(str, lang);
      if (lang) {
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      }
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    },
  });

  md.use(texmath, {
    engine: katex,
    delimiters: ['dollars', 'brackets', 'doxygen', 'gitlab', 'julia', 'kramdown'],
    katexOptions: {
      macros: { '\\RR': '\\mathbb{R}' },
      throwOnError: false,
    },
  });

  return md;
}

export interface RenderOptions {
  breaks?: boolean;
}

// Mermaid placeholder marker
const MERMAID_PLACEHOLDER = 'data-mermaid';

export function renderMarkdown(content: string, options: RenderOptions = {}): string {
  const parser = getParser(options.breaks);

  let html = parser.render(content);

  // Convert mermaid code blocks to placeholders for lazy rendering
  html = html.replace(
    /<pre><code class="hljs language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_match, code: string) => {
      const decoded = code
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
      const b64 = btoa(unescape(encodeURIComponent(decoded)));
      return `<div class="mermaid-placeholder" ${MERMAID_PLACEHOLDER}="${b64}"></div>`;
    },
  );

  return html;
}

export function hasMermaidCharts(html: string): boolean {
  return html.includes(MERMAID_PLACEHOLDER);
}

export function resetParser(): void {
  md = null;
}

export function renderMarkdownAsync(content: string, _options: RenderOptions = {}): Promise<string> {
  // Use main-thread renderer directly to ensure consistent parser config
  // (Worker-based rendering caused config desync issues with texmath/highlight)
  return Promise.resolve(renderMarkdown(content));
}
