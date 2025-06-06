const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    const locale = currency === 'KHR' ? 'km' : 'en-US';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

export default formatCurrency;
