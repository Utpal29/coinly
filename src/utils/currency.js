// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: '$',
  CAD: '$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  SGD: '$'
};

// Format amount with currency symbol
export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${Math.abs(amount).toFixed(2)}`;
};

// Format amount with currency symbol and sign
export const formatCurrencyWithSign = (amount, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${symbol}${Math.abs(amount).toFixed(2)}`;
}; 