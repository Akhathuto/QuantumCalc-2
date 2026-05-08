export const formatNumber = (num: number | string): string => {
  const format = localStorage.getItem('numberFormat') || 'us';
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
