// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/nativeApp.css';
import './styles/animations.css';
import './styles/appPro.css';

// Đăng ký Service Worker khi chạy trên trình duyệt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('PWA ServiceWorker registered: ', reg.scope))
      .catch((err) => console.error('PWA ServiceWorker registration failed: ', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
