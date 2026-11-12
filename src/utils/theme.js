// src/utils/theme.js - Cố định Chế độ Tối (Dark Mode) toàn hệ thống
export function toggleTheme() {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
  }
  try {
    localStorage.setItem('uth_theme', 'dark');
  } catch {}
  return true;
}

export function getInitialThemeIsDark() {
  toggleTheme();
  return true;
}
