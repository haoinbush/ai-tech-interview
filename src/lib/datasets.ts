/** Table schemas for dataset preview UI */
export const SQL_TABLES: { name: string; columns: { name: string; type: string }[] }[] = [
  {
    name: 'transactions',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'amount', type: 'REAL' },
      { name: 'currency', type: 'TEXT' },
      { name: 'timestamp', type: 'TEXT' },
      { name: 'type', type: 'TEXT' },
    ],
  },
  {
    name: 'stock_prices',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'symbol', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'open', type: 'REAL' },
      { name: 'high', type: 'REAL' },
      { name: 'low', type: 'REAL' },
      { name: 'close', type: 'REAL' },
      { name: 'volume', type: 'INTEGER' },
    ],
  },
  {
    name: 'portfolio_holdings',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'user_id', type: 'INTEGER' },
      { name: 'symbol', type: 'TEXT' },
      { name: 'quantity', type: 'REAL' },
      { name: 'avg_cost', type: 'REAL' },
    ],
  },
  {
    name: 'risk_metrics',
    columns: [
      { name: 'id', type: 'INTEGER' },
      { name: 'symbol', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'volatility', type: 'REAL' },
      { name: 'beta', type: 'REAL' },
      { name: 'sharpe_ratio', type: 'REAL' },
    ],
  },
  {
    name: 'stripe_transactions',
    columns: [
      { name: 'transaction_id', type: 'INTEGER' },
      { name: 'merchant_id', type: 'INTEGER' },
      { name: 'credit_card_id', type: 'INTEGER' },
      { name: 'amount', type: 'INTEGER' },
      { name: 'transaction_timestamp', type: 'TEXT' },
    ],
  },
  {
    name: 'stripe_employees',
    columns: [
      { name: 'employee_id', type: 'INTEGER' },
      { name: 'name', type: 'TEXT' },
      { name: 'salary', type: 'REAL' },
      { name: 'department_id', type: 'INTEGER' },
      { name: 'manager_id', type: 'INTEGER' },
    ],
  },
  {
    name: 'stripe_customers',
    columns: [
      { name: 'customer_id', type: 'INTEGER' },
      { name: 'customer_name', type: 'TEXT' },
      { name: 'sign_up_date', type: 'TEXT' },
    ],
  },
  {
    name: 'stripe_customer_transactions',
    columns: [
      { name: 'transaction_id', type: 'INTEGER' },
      { name: 'customer_id', type: 'INTEGER' },
      { name: 'transaction_date', type: 'TEXT' },
      { name: 'amount', type: 'REAL' },
    ],
  },
  {
    name: 'stripe_views',
    columns: [
      { name: 'view_id', type: 'INTEGER' },
      { name: 'user_id', type: 'TEXT' },
      { name: 'view_date', type: 'TEXT' },
      { name: 'service_id', type: 'INTEGER' },
    ],
  },
  {
    name: 'stripe_adds',
    columns: [
      { name: 'add_id', type: 'INTEGER' },
      { name: 'user_id', type: 'TEXT' },
      { name: 'add_date', type: 'TEXT' },
      { name: 'service_id', type: 'INTEGER' },
    ],
  },
];
