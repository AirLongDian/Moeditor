export type ThemeName = 'light' | 'dark';

export function applyTheme(name: ThemeName): void {
  document.documentElement.classList.toggle('dark', name === 'dark');
  localStorage.setItem('moeditor-theme', name);
}

export function getCurrentTheme(): ThemeName {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function initTheme(): ThemeName {
  const saved = localStorage.getItem('moeditor-theme') as ThemeName | null;
  const theme = saved || 'light';
  applyTheme(theme);
  return theme;
}
