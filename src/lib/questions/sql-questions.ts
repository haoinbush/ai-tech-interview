import type { Question } from '@/types/question';

export const sqlQuestions: Question[] = [
  {
    id: 'sql-1',
    title: 'Top 10 users by transaction volume',
    topic: 'sql',
    difficulty: 'easy',
    fintechDomain: 'payments',
    description: 'Write a SQL query to find the top 10 users by total transaction amount. Return user_id and total_amount, ordered by total_amount descending.',
    starterCode: `-- Your query here
SELECT 
  
FROM transactions
`,
    solution: `SELECT 
  user_id,
  SUM(amount) AS total_amount
FROM transactions
GROUP BY user_id
ORDER BY total_amount DESC
LIMIT 10;`,
    hints: ['Use SUM() and GROUP BY', 'Order by the aggregated amount descending'],
    datasetId: 'fintech',
  },
  {
    id: 'sql-2',
    title: 'Daily returns by symbol',
    topic: 'sql',
    difficulty: 'medium',
    fintechDomain: 'trading',
    description: 'Calculate the daily percentage return for each stock symbol. Return symbol, date, and daily_return. Formula: (close - open) / open * 100.',
    starterCode: `-- Your query here
SELECT 
  
FROM stock_prices
`,
    solution: `SELECT 
  symbol,
  date,
  ROUND((close - open) / open * 100, 2) AS daily_return
FROM stock_prices
ORDER BY symbol, date;`,
    hints: ['Use arithmetic in SELECT', 'ROUND() for decimal precision'],
    datasetId: 'fintech',
  },
  {
    id: 'sql-3',
    title: 'Portfolio value by user',
    topic: 'sql',
    difficulty: 'medium',
    fintechDomain: 'portfolio',
    description: 'Calculate the current portfolio value for each user. Join portfolio_holdings with the latest stock_prices (use the most recent date per symbol). Return user_id and total_value.',
    starterCode: `-- Your query here
SELECT 
  
FROM portfolio_holdings ph
JOIN stock_prices sp ON ph.symbol = sp.symbol
`,
    solution: `WITH latest_prices AS (
  SELECT symbol, close,
    ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY date DESC) AS rn
  FROM stock_prices
)
SELECT 
  ph.user_id,
  ROUND(SUM(ph.quantity * lp.close), 2) AS total_value
FROM portfolio_holdings ph
JOIN latest_prices lp ON ph.symbol = lp.symbol AND lp.rn = 1
GROUP BY ph.user_id;`,
    hints: ['Use a CTE or subquery to get latest price per symbol', 'ROW_NUMBER() or MAX(date) with GROUP BY'],
    datasetId: 'fintech',
  },
  {
    id: 'sql-4',
    title: 'High volatility stocks',
    topic: 'sql',
    difficulty: 'easy',
    fintechDomain: 'risk',
    description: 'Find all stocks with volatility greater than 0.3. Return symbol, volatility, and sharpe_ratio from risk_metrics.',
    starterCode: `-- Your query here
SELECT 
  
FROM risk_metrics
`,
    solution: `SELECT 
  symbol,
  volatility,
  sharpe_ratio
FROM risk_metrics
WHERE volatility > 0.3
ORDER BY volatility DESC;`,
    hints: ['Simple WHERE clause', 'Filter on volatility column'],
    datasetId: 'fintech',
  },
  {
    id: 'sql-5',
    title: 'Transaction count by type and currency',
    topic: 'sql',
    difficulty: 'easy',
    fintechDomain: 'payments',
    description: 'Count the number of transactions grouped by type and currency. Return type, currency, and transaction_count.',
    starterCode: `-- Your query here
SELECT 
  
FROM transactions
`,
    solution: `SELECT 
  type,
  currency,
  COUNT(*) AS transaction_count
FROM transactions
GROUP BY type, currency
ORDER BY transaction_count DESC;`,
    hints: ['Use COUNT(*) with GROUP BY', 'Group by multiple columns'],
    datasetId: 'fintech',
  },
  {
    id: 'sql-6',
    title: 'Average portfolio cost by symbol',
    topic: 'sql',
    difficulty: 'easy',
    fintechDomain: 'portfolio',
    description: 'Calculate the average cost basis (avg_cost) per symbol across all users in portfolio_holdings. Return symbol and avg_cost_basis.',
    starterCode: `-- Your query here
SELECT 
  
FROM portfolio_holdings
`,
    solution: `SELECT 
  symbol,
  ROUND(AVG(avg_cost), 2) AS avg_cost_basis
FROM portfolio_holdings
GROUP BY symbol;`,
    hints: ['Use AVG() with GROUP BY'],
    datasetId: 'fintech',
  },
  {
    id: 'sql-7',
    title: 'Monthly transaction volume',
    topic: 'sql',
    difficulty: 'medium',
    fintechDomain: 'payments',
    description: 'Calculate total transaction amount by month. Extract month from the timestamp column. Return year_month (e.g., 2024-01) and total_amount.',
    starterCode: `-- Your query here
SELECT 
  
FROM transactions
`,
    solution: `SELECT 
  strftime('%Y-%m', timestamp) AS year_month,
  ROUND(SUM(amount), 2) AS total_amount
FROM transactions
GROUP BY year_month
ORDER BY year_month;`,
    hints: ['Use strftime for SQLite date formatting', 'strftime("%Y-%m", timestamp) for year-month'],
    datasetId: 'fintech',
  },
  {
    id: 'sql-8',
    title: 'Best Sharpe ratio stocks',
    topic: 'sql',
    difficulty: 'easy',
    fintechDomain: 'risk',
    description: 'Find the top 3 stocks by Sharpe ratio from risk_metrics. Use the most recent date per symbol. Return symbol, sharpe_ratio, and date.',
    starterCode: `-- Your query here
SELECT 
  
FROM risk_metrics
`,
    solution: `WITH ranked AS (
  SELECT symbol, sharpe_ratio, date,
    ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY date DESC) AS rn
  FROM risk_metrics
)
SELECT symbol, sharpe_ratio, date
FROM ranked
WHERE rn = 1
ORDER BY sharpe_ratio DESC
LIMIT 3;`,
    hints: ['Use ROW_NUMBER() to get latest per symbol', 'Or use MAX(date) with GROUP BY'],
    datasetId: 'fintech',
  },
];
