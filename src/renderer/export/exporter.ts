import { renderMarkdown } from '../preview/renderer';

export async function exportHTML(content: string, dir: string): Promise<string> {
  const bodyHtml = renderMarkdown(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Exported Document</title>
<style>
  body {
    max-width: 860px; margin: 0 auto; padding: 40px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px; line-height: 1.7; color: #333;
  }
  pre { background: #f6f8fa; padding: 12px 16px; border-radius: 4px; overflow-x: auto; }
  code { font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.9em; }
  p > code { background: #f6f8fa; padding: 1px 5px; border-radius: 3px; }
  blockquote { border-left: 3px solid #3498db; padding: 4px 14px; color: #666; margin: 10px 0; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  th, td { border: 1px solid #ddd; padding: 6px 13px; text-align: left; }
  th { background: #f5f5f5; }
  img { max-width: 100%; }
  h1, h2 { border-bottom: 1px solid #eee; padding-bottom: 6px; }
  .mermaid-placeholder { display: none; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export async function exportPDFHTML(content: string): Promise<string> {
  const bodyHtml = renderMarkdown(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @page { margin: 20mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px; line-height: 1.6; color: #333; }
  pre { background: #f6f8fa; padding: 10px 14px; border-radius: 4px; white-space: pre-wrap; }
  code { font-family: 'Consolas', monospace; font-size: 0.9em; }
  blockquote { border-left: 3px solid #3498db; padding: 4px 12px; color: #666; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 4px 10px; }
  th { background: #f5f5f5; }
  img { max-width: 100%; }
  .mermaid-placeholder { display: none; }
</style>
</head>
<body>
${bodyHtml}
<script>
  // Signal ready for PDF capture after fonts load
  window.onload = function() {
    if (window.moeditorAPI) {
      window.moeditorAPI.setConfig('export-ready', true);
    }
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('ready-export-pdf');
  };
</script>
</body>
</html>`;
}
