// src/utils/theme.js - Quản lý đồng bộ Dark / Light Mode qua class 'dark' trên thẻ <html>
export function toggleTheme(isDark) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('uth_theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('uth_theme', 'light');
  }
}

export function getInitialThemeIsDark() {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('uth_theme');
  const isDark = saved ? saved === 'dark' : true;
  toggleTheme(isDark);
  return isDark;
}

