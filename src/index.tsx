import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'katex/dist/katex.min.css';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Fail-safe protection against Vite/infrastructure interceptors crashing on circular JSON objects in console.error
const originalConsoleError = console.error;
console.error = (...args) => {
  try {
    const safeArgs = args.map(arg => {
      if (arg instanceof Error) {
        return `[Error: ${arg.name} - ${arg.message}]`;
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          JSON.stringify(arg);
          return arg;
        } catch {
          return '[Unserializable Object Omitted]';
        }
      }
      return arg;
    });
    originalConsoleError(...safeArgs);
  } catch {
    originalConsoleError("Logging failed to serialize.");
  }
};

// Global protection against circular JSON payloads crashing the app overlay
const originalStringify = JSON.stringify;
JSON.stringify = function(value, replacer, space) {
  try {
    return originalStringify(value, replacer as any, space);
  } catch (e) {
    if (e instanceof TypeError && e.message.includes('circular')) {
      const cache = new Set();
      return originalStringify(value, (key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (cache.has(val)) return '[Circular Reference]';
          cache.add(val);
        }
        if (typeof replacer === 'function') return (replacer as any)(key, val);
        return val;
      }, space);
    }
    throw e;
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);