/**
 * Utilities for Indian currency numbering system (Lakhs, Thousands, Crores)
 * Adds commas after lakhs and thousands for clear readability (e.g., 2,50,000 / 1,80,000).
 */

export const formatIndianCurrency = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return num.toLocaleString('en-IN');
};

export const parseIndianCurrency = (str: string | undefined | null): number => {
  if (!str) return 0;
  const digits = String(str).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export const formatIncomeWords = (val: number | string | undefined | null): string => {
  const num = typeof val === 'number' ? val : parseIndianCurrency(val);
  if (!num || num <= 0) return '';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n: number) => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };

  const convertThreeDigits = (n: number) => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (hundred ? ones[hundred] + ' Hundred' + (rest ? ' ' : '') : '') + convertTwoDigits(rest);
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  if (crore) result += convertTwoDigits(crore) + ' Crore ';
  if (lakh) result += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand) result += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder) result += convertThreeDigits(remainder);

  return result.trim() + ' Rupees';
};
