export function formatCurrency(amount: number, currency: 'USD' | 'EUR' | 'GBP' = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function getCurrencySymbol(currency: 'USD' | 'EUR' | 'GBP' = 'USD'): string {
  switch (currency) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'USD': default: return '$';
  }
}
