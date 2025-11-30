import { createRoot } from 'react-dom/client';
import App from './App';

function mountApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Could not find root element to mount to');
    }

    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (err) {
    // Log error and show a simple fallback so the page isn't blank
    // This helps recover from issues like unexpected script execution order
    // or service-worker stale caches that lead to runtime failures.
    // eslint-disable-next-line no-console
    console.error('Failed to mount React app:', err);

    try {
      const body = document.body || document.getElementsByTagName('body')[0];
      if (body) {
        const pre = document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.background = '#111827';
        pre.style.color = '#e2e8f0';
        pre.style.padding = '1rem';
        pre.style.borderRadius = '6px';
        pre.style.margin = '1rem';
        const errorStack = (err instanceof Error && err.stack) ? err.stack : String(err);
        pre.textContent = 'Application failed to start. Check console for details.\n' + errorStack;
        body.innerHTML = '';
        body.appendChild(pre);
      }
    } catch (e) {
      // ignore
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', mountApp, { once: true });
} else {
  mountApp();
}