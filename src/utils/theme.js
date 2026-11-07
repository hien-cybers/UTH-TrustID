// src/utils/theme.js - Đồng bộ cố định giao diện Dark Neon (Ocean-Ice) trên toàn hệ thống
export function toggleTheme() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('dark');
  root.setAttribute('data-theme', 'dark');
  try {
    localStorage.setItem('uth_theme', 'dark');
  } catch {}
}

export function getInitialThemeIsDark() {
  if (typeof window === 'undefined') return true;
  toggleTheme(true);
  return true;
}


