export const exportToCSV = (transactions, currency) => {
  // Define CSV headers
  const headers = [
    'Date',
    'Description',
    'Category',
    'Amount',
    'Type'
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map(transaction => {
    const date = new Date(transaction.date).toLocaleDateString();
    const amount = Math.abs(transaction.amount).toFixed(2);
    const type = transaction.amount > 0 ? 'Income' : 'Expense';
    
    return [
      date,
      transaction.description,
      transaction.category,
      `${amount} ${currency}`,
      type
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 