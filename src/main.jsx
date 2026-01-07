  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.jsx'

  // Suppress external share-modal errors from browser extensions or injected scripts
  try {
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof source === 'string' && source.indexOf('share-modal.js') !== -1) {
        return true; // prevent default logging for this specific source
      }
      return false;
    };
    window.addEventListener('error', (e) => {
      const src = (e && e.filename) || '';
      if (src && src.indexOf('share-modal.js') !== -1) {
        e.preventDefault();
      }
    });
    // Also handle unhandled promise rejections possibly thrown by external scripts
    window.addEventListener('unhandledrejection', (e) => {
      const reason = e && e.reason;
      const stack = (reason && reason.stack) || '';
      if (typeof stack === 'string' && stack.indexOf('share-modal.js') !== -1) {
        e.preventDefault();
      }
    });
    // Filter console.error messages that reference share-modal.js
    const origConsoleError = console.error;
    console.error = function(...args) {
      try {
        const joined = args.map(a => (typeof a === 'string' ? a : (a && a.message) || '')).join(' ');
        if (joined.indexOf('share-modal.js') !== -1) {
          return;
        }
      } catch {}
      return origConsoleError.apply(console, args);
    };
  } catch {}


  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
