// src/utils/theme.js - Quản lý đồng bộ Chế độ Sáng / Tối (Light & Dark Mode) toàn hệ thống
export function toggleTheme(forceIsDark) {
  if (typeof document === 'undefined') return true;
  const root = document.documentElement;
  const currentIsDark = root.getAttribute('data-theme') !== 'light';
  const nextIsDark = typeof forceIsDark === 'boolean' ? forceIsDark : !currentIsDark;
  const mode = nextIsDark ? 'dark' : 'light';

  if (nextIsDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  root.setAttribute('data-theme', mode);

  try {
    localStorage.setItem('uth_theme', mode);
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uth-theme-changed', { detail: { isDark: nextIsDark, mode } }));
  }
  return nextIsDark;
}

export function getInitialThemeIsDark() {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem('uth_theme');
    const isDark = saved ? saved !== 'light' : true;
    toggleTheme(isDark);
    return isDark;
  } catch {
    toggleTheme(true);
    return true;
  }
}
