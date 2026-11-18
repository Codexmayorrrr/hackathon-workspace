import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Enable immediate CSS :active press states on mobile Safari and touch devices
if (typeof window !== 'undefined') {
  document.addEventListener('touchstart', () => {}, { passive: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
