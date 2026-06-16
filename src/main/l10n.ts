type Translations = Record<string, string>;

const en: Translations = {
  'File': 'File', 'New': 'New', 'Open': 'Open', 'Save': 'Save', 'Save as': 'Save As',
  'Export': 'Export', 'Edit': 'Edit', 'Undo': 'Undo', 'Redo': 'Redo',
  'Cut': 'Cut', 'Copy': 'Copy', 'Paste': 'Paste', 'Delete': 'Delete',
  'Select All': 'Select All', 'Mode': 'Mode', 'Read Mode': 'Read Mode',
  'Write Mode': 'Write Mode', 'Preview Mode': 'Preview Mode',
  'View': 'View', 'Window': 'Window', 'Help': 'Help',
  'Close': 'Close', 'Minimize': 'Minimize', 'Zoom': 'Zoom',
  'Toggle Developer Tools': 'Toggle Developer Tools',
  'Moeditor on GitHub': 'Moeditor on GitHub',
  'About Moeditor': 'About Moeditor', 'Preferences': 'Preferences',
  'Hide Moeditor': 'Hide Moeditor', 'Hide Others': 'Hide Others',
  'Show All': 'Show All', 'Quit Moeditor': 'Quit Moeditor',
  'Services': 'Services', 'Yes': 'Yes', 'No': 'No', 'Cancel': 'Cancel',
  'Confirm': 'Confirm', 'Save changes to file?': 'Save changes to file?',
  'Settings': 'Settings', 'About': 'About',
  'Export as HTML': 'Export as HTML', 'Export as PDF': 'Export as PDF',
  'Focus Mode': 'Focus Mode', 'Menu': 'Menu',
};

const zhCN: Translations = {
  'File': '文件', 'New': '新建', 'Open': '打开', 'Save': '保存', 'Save as': '另存为',
  'Export': '导出', 'Edit': '编辑', 'Undo': '撤销', 'Redo': '重做',
  'Cut': '剪切', 'Copy': '复制', 'Paste': '粘贴', 'Delete': '删除',
  'Select All': '全选', 'Mode': '模式', 'Read Mode': '阅读模式',
  'Write Mode': '写作模式', 'Preview Mode': '预览模式',
  'View': '视图', 'Window': '窗口', 'Help': '帮助',
  'Close': '关闭', 'Minimize': '最小化', 'Zoom': '缩放',
  'Toggle Developer Tools': '开发者工具',
  'Moeditor on GitHub': 'GitHub 上的 Moeditor',
  'About Moeditor': '关于 Moeditor', 'Preferences': '偏好设置',
  'Hide Moeditor': '隐藏 Moeditor', 'Hide Others': '隐藏其他',
  'Show All': '全部显示', 'Quit Moeditor': '退出 Moeditor',
  'Services': '服务', 'Yes': '是', 'No': '否', 'Cancel': '取消',
  'Confirm': '确认', 'Save changes to file?': '保存文件更改？',
  'Settings': '设置', 'About': '关于',
  'Export as HTML': '导出为 HTML', 'Export as PDF': '导出为 PDF',
  'Focus Mode': '专注模式', 'Menu': '菜单',
};

const locales: Record<string, Translations> = { en, zh_CN: zhCN };

let currentLocale = 'en';

export function setLocale(locale: string): void {
  if (locales[locale]) {
    currentLocale = locale;
  } else {
    // Try language-only fallback
    const lang = locale.split('_')[0] || locale;
    const match = Object.keys(locales).find(k => k.startsWith(lang));
    currentLocale = match || 'en';
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function __(key: string): string {
  return locales[currentLocale]?.[key] || locales.en?.[key] || key;
}

export function getAvailableLocales(): string[] {
  return Object.keys(locales);
}
