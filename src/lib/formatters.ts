let cachedFormat: string | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('numberFormat-change', () => {
    cachedFormat = null;
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'numberFormat') {
      cachedFormat = null;
    }
  });
}

export const formatNumber = (num: number | string): string => {
  if (cachedFormat === null) {
    try {
      cachedFormat = localStorage.getItem('numberFormat') || 'us';
    } catch {
      cachedFormat = 'us';
    }
  }
  const format = cachedFormat;
  const numStr = typeof num === 'number' ? num.toString() : num;
  
  if (!numStr || isNaN(Number(numStr))) return numStr;

  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] || '';

  if (format === 'eu') {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
  } else {
    // US Format (default)
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  }
};
