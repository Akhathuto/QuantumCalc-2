import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'katex/dist/katex.min.css';
import { AuthProvider } from './components/AuthProvider';

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

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);