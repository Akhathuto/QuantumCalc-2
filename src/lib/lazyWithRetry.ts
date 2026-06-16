import { ComponentType } from 'react';

/**
 * Wraps a dynamic import matching the React.lazy signature, and adds retry logic
 * with exponential backoff. Essential for maintaining uptime when the environment
 * undergoes hot restores, proxy timeouts, or short network drops.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retriesLeft = 3,
  interval = 800
): Promise<{ default: T }> {
  return componentImport().catch((error) => {
    // If the error message indicates a network or chunk loading failure, retry it!
    const errorStr = String(error).toLowerCase();
    const isChunkError = 
      errorStr.includes('failed to fetch dynamically imported module') ||
      errorStr.includes('failed to fetch') ||
      errorStr.includes('loading chunk') ||
      errorStr.includes('preload') ||
      errorStr.includes('network error');

    if (!isChunkError || retriesLeft <= 0) {
      throw error;
    }

    console.warn(
      `[QuantumCalc] Dynamic chunk fetch failed. Retrying in ${interval}ms... (Retries left: ${retriesLeft})`,
      error
    );

    return new Promise<{ default: T }>((resolve, reject) => {
      setTimeout(() => {
        lazyWithRetry(componentImport, retriesLeft - 1, interval * 1.5)
          .then(resolve)
          .catch(reject);
      }, interval);
    });
  });
}
