const { formatCurrency } = require('./formatCurrency');

test('formats currency correctly', () => {
  // Compare object contents; toBe only checks whether both values are the same object.
  expect(formatCurrency(10.005, 'USD')).toEqual({ amount: 10.01, currency: 'USD' });
});
