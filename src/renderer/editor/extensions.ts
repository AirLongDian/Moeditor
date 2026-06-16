import { Extension } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import {
  syntaxHighlighting, bracketMatching, foldKeymap,
  HighlightStyle,
} from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
  rectangularSelection, crosshairCursor, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { indentOnInput, foldGutter } from '@codemirror/language';

// Markdown syntax highlighting based on base16-light palette
const markdownHighlightStyle = HighlightStyle.define([
  // Headings (# ## ### ...) — bold and colored
  { tag: tags.heading, color: '#202020', fontWeight: 'bold' },
  { tag: tags.heading1, color: '#202020', fontWeight: 'bold', fontSize: '1.5em' },
  { tag: tags.heading2, color: '#202020', fontWeight: 'bold', fontSize: '1.3em' },
  { tag: tags.heading3, color: '#202020', fontWeight: 'bold', fontSize: '1.2em' },
  // Formatting markers (# * ** > - []) — muted gray so content stands out
  { tag: tags.processingInstruction, color: '#b0b0b0' },
  { tag: tags.contentSeparator, color: '#b0b0b0' },
  // Bold (**text**) — blue
  { tag: tags.strong, color: '#1a88d7', fontWeight: 'bold' },
  // Italic (*text*) — green
  { tag: tags.emphasis, color: '#28d573', fontStyle: 'italic' },
  // Links [text](url) — purple text, amber URL
  { tag: tags.link, color: '#aa759f', textDecoration: 'underline' },
  { tag: tags.url, color: '#d57d34' },
  // Inline code — dark red
  { tag: tags.monospace, color: '#ac4142', fontFamily: "'Fira Code', 'Consolas', monospace" },
  // Blockquote — green
  { tag: tags.quote, color: '#90a959', fontStyle: 'italic' },
  // List markers (- *) — dark
  { tag: tags.list, color: '#d28445' },
  // HTML tags in markdown
  { tag: tags.tagName, color: '#ac4142' },
  { tag: tags.attributeName, color: '#90a959' },
  { tag: tags.attributeValue, color: '#f4bf75' },
  // Comments (<!-- -->)
  { tag: tags.comment, color: '#8f5536', fontStyle: 'italic' },
  // Math ($...$)
  { tag: tags.special(tags.string), color: '#603d7b' },
  // Code block fence (```)
  { tag: tags.keyword, color: '#ac4142' },
  // Horizontal rule (---)
  { tag: tags.contentSeparator, color: '#b0b0b0' },
  // Image alt text / title
  { tag: tags.labelName, color: '#6a9fb5' },
  // Strikethrough
  { tag: tags.strikethrough, color: '#8f5536', textDecoration: 'line-through' },
]);

function baseExtensions(): Extension[] {
  return [
    highlightSpecialChars(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    history(),
    foldGutter(),
    indentOnInput(),
    syntaxHighlighting(markdownHighlightStyle),
    bracketMatching(),
    closeBrackets(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
    ]),
  ];
}

export function editorExtensions(theme?: string): Extension[] {
  const exts: Extension[] = [
    ...baseExtensions(),
    markdown({ base: markdownLanguage }),
  ];

  if (theme === 'dark') {
    exts.push(oneDark);
  }

  return exts;
}
