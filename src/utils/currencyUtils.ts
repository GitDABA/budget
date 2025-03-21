// Currency configuration options
export interface CurrencyConfig {
  code: string;         // ISO currency code (e.g., EUR, USD)
  symbol: string;       // Currency symbol (e.g., €, $)
  name: string;         // Full currency name
  decimalPlaces: number; // Default decimal places
  format: string;       // Excel number format
  locale: string;       // Locale for formatting
}

// Available currencies in the app
export const availableCurrencies: CurrencyConfig[] = [
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    format: '€#,##0.00',
    locale: 'de-DE'
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    format: '$#,##0.00',
    locale: 'en-US'
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    format: '£#,##0.00',
    locale: 'en-GB'
  },
  {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    decimalPlaces: 2,
    format: 'kr #,##0.00',
    locale: 'nb-NO'
  },
  {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    decimalPlaces: 2,
    format: 'kr #,##0.00',
    locale: 'sv-SE'
  },
  {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    decimalPlaces: 2,
    format: 'kr #,##0.00',
    locale: 'da-DK'
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalPlaces: 0,
    format: '¥#,##0',
    locale: 'ja-JP'
  }
];

// Default currency
export const defaultCurrency: CurrencyConfig = availableCurrencies[0]; // EUR by default

// Format a number according to currency formatting rules
export const formatCurrency = (
  amount: number, 
  currency: CurrencyConfig = defaultCurrency
): string => {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(amount);
};

// Format a number for display without currency symbol
export const formatNumber = (
  amount: number, 
  currency: CurrencyConfig = defaultCurrency
): string => {
  return new Intl.NumberFormat(currency.locale, {
    style: 'decimal',
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(amount);
};
