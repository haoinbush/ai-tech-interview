import type { Question } from '@/types/question';

/**
 * Curated Stripe and fintech company-specific questions.
 * Based on DataLemur Stripe SQL and InterviewQuery Stripe Data Scientist guides.
 */
export const companyQuestions: Question[] = [
  {
    id: 'stripe-sql-1',
    title: 'Repeated Payments',
    topic: 'sql',
    difficulty: 'medium',
    fintechDomain: 'payments',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['sql', 'payments'],
    description: `Sometimes payment transactions are repeated by accident—due to user error, API failure, or a retry error that causes a credit card to be charged twice.

Using the stripe_transactions table, identify any payments made at the same merchant with the same credit card for the same amount within 10 minutes of each other. Count such repeated payments.

Table: stripe_transactions (transaction_id, merchant_id, credit_card_id, amount, transaction_timestamp)`,
    starterCode: `-- Count repeated payments (same merchant, card, amount within 10 min)
SELECT 
  
FROM stripe_transactions
`,
    solution: `WITH pairs AS (
  SELECT 
    t1.transaction_id AS id1,
    t2.transaction_id AS id2
  FROM stripe_transactions t1
  JOIN stripe_transactions t2 
    ON t1.merchant_id = t2.merchant_id
    AND t1.credit_card_id = t2.credit_card_id
    AND t1.amount = t2.amount
    AND t1.transaction_id < t2.transaction_id
    AND (julianday(t2.transaction_timestamp) - julianday(t1.transaction_timestamp)) * 24 * 60 <= 10
)
SELECT COUNT(*) AS payment_count FROM pairs;`,
    hints: ['Self-join on merchant_id, credit_card_id, amount', 'Use julianday() for timestamp diff in SQLite', 'Filter for transactions within 10 minutes'],
    datasetId: 'stripe',
  },
  {
    id: 'stripe-sql-2',
    title: 'Employees Earning More Than Managers',
    topic: 'sql',
    difficulty: 'easy',
    fintechDomain: 'general',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['sql'],
    description: `Given the stripe_employees table, write a SQL query to find employees who make more than their own manager.

Table: stripe_employees (employee_id, name, salary, department_id, manager_id)`,
    starterCode: `-- Find employees earning more than their manager
SELECT 
  
FROM stripe_employees
`,
    solution: `SELECT 
  e.employee_id,
  e.name AS employee_name
FROM stripe_employees e
JOIN stripe_employees m ON e.manager_id = m.employee_id
WHERE e.salary > m.salary;`,
    hints: ['Self-join: employees table aliased as e and m', 'Join e.manager_id = m.employee_id', 'Filter e.salary > m.salary'],
    datasetId: 'stripe',
  },
  {
    id: 'stripe-sql-3',
    title: 'Highest Transaction Customer Per Month',
    topic: 'sql',
    difficulty: 'medium',
    fintechDomain: 'payments',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['sql', 'payments'],
    description: `Stripe wants to analyze transactions to see which customer had the highest total transaction amount for each month.

Given stripe_customers and stripe_customer_transactions, write a query to return the customer_id and total amount of the customer who had the highest total transaction amount for each month. Sort by year, month, and total amount descending.

Tables: stripe_customers (customer_id, customer_name, sign_up_date), stripe_customer_transactions (transaction_id, customer_id, transaction_date, amount)`,
    starterCode: `-- Highest spending customer per month
SELECT 
  
FROM stripe_customer_transactions t
JOIN stripe_customers c ON t.customer_id = c.customer_id
`,
    solution: `WITH monthly_totals AS (
  SELECT 
    customer_id,
    strftime('%Y-%m', transaction_date) AS year_month,
    SUM(amount) AS total_amount
  FROM stripe_customer_transactions
  GROUP BY customer_id, year_month
),
ranked AS (
  SELECT 
    customer_id,
    year_month,
    total_amount,
    RANK() OVER (PARTITION BY year_month ORDER BY total_amount DESC) AS rn
  FROM monthly_totals
)
SELECT customer_id, year_month, total_amount
FROM ranked
WHERE rn = 1
ORDER BY year_month, total_amount DESC;`,
    hints: ['CTE 1: Group by customer and month, SUM(amount)', 'CTE 2: RANK() OVER (PARTITION BY month ORDER BY total DESC)', 'Filter WHERE rn = 1'],
    datasetId: 'stripe',
  },
  {
    id: 'stripe-sql-4',
    title: 'Average Transaction Amount Per Customer',
    topic: 'sql',
    difficulty: 'easy',
    fintechDomain: 'payments',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['sql', 'payments'],
    description: `Find the average transaction amount for each customer for the year 2022. Return customer_id and avg_transaction_amount.

Table: stripe_customer_transactions (transaction_id, customer_id, transaction_date, amount)`,
    starterCode: `-- Average transaction per customer in 2022
SELECT 
  
FROM stripe_customer_transactions
`,
    solution: `SELECT 
  customer_id,
  ROUND(AVG(amount), 2) AS avg_transaction_amount
FROM stripe_customer_transactions
WHERE strftime('%Y', transaction_date) = '2022'
GROUP BY customer_id;`,
    hints: ['Use strftime to filter year', 'AVG(amount) with GROUP BY customer_id'],
    datasetId: 'stripe',
  },
  {
    id: 'stripe-sql-5',
    title: 'Click-Through Conversion Rate',
    topic: 'sql',
    difficulty: 'medium',
    fintechDomain: 'payments',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['sql', 'payments', 'analytics'],
    description: `Calculate the click-through conversion rate from viewing a digital service to adding it to cart, per service.

Tables: stripe_views (view_id, user_id, view_date, service_id), stripe_adds (add_id, user_id, add_date, service_id)

Conversion rate = adds / views per service. Use NULLIF to avoid division by zero.`,
    starterCode: `-- Conversion rate per service
SELECT 
  
FROM stripe_views v
LEFT JOIN stripe_adds a ON v.service_id = a.service_id
`,
    solution: `WITH view_counts AS (
  SELECT service_id, COUNT(*) AS views
  FROM stripe_views
  GROUP BY service_id
),
add_counts AS (
  SELECT service_id, COUNT(*) AS adds
  FROM stripe_adds
  GROUP BY service_id
)
SELECT 
  v.service_id,
  ROUND(1.0 * COALESCE(a.adds, 0) / NULLIF(v.views, 0), 2) AS conversion_rate
FROM view_counts v
LEFT JOIN add_counts a ON v.service_id = a.service_id;`,
    hints: ['Count views and adds per service_id separately', 'Join and compute adds/views', 'Use NULLIF(views, 0) to avoid division by zero'],
    datasetId: 'stripe',
  },
  {
    id: 'stripe-python-1',
    title: 'Transaction Fraud Score (Pandas)',
    topic: 'python',
    difficulty: 'medium',
    fintechDomain: 'payments',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['python', 'payments', 'fraud'],
    description: `Given a DataFrame of transactions with columns: transaction_id, user_id, amount, timestamp. Flag transactions as potentially fraudulent if the same user has another transaction within 5 minutes with similar amount (within 10%).

Return a DataFrame with transaction_id and is_suspicious (boolean).`,
    starterCode: `import pandas as pd

def flag_suspicious_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Flag transactions that may be duplicates/fraud."""
    # Your code here
    pass
`,
    solution: `import pandas as pd

def flag_suspicious_transactions(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(['user_id', 'timestamp'])
    df['prev_ts'] = df.groupby('user_id')['timestamp'].shift(1)
    df['prev_amt'] = df.groupby('user_id')['amount'].shift(1)
    df['time_diff'] = (df['timestamp'] - df['prev_ts']).dt.total_seconds() / 60
    df['amt_ratio'] = df['amount'] / df['prev_amt']
    df['is_suspicious'] = (
        (df['time_diff'] <= 5) & 
        (df['amt_ratio'] >= 0.9) & 
        (df['amt_ratio'] <= 1.1)
    ).fillna(False)
    return df[['transaction_id', 'is_suspicious']]

# Example
df = pd.DataFrame({
    'transaction_id': [1, 2, 3],
    'user_id': [1, 1, 2],
    'amount': [100, 105, 50],
    'timestamp': ['2024-01-01 10:00', '2024-01-01 10:03', '2024-01-01 11:00']
})
print(flag_suspicious_transactions(df))`,
    hints: ['Sort by user_id and timestamp', 'Use shift() to get previous row', 'Check time diff and amount ratio'],
    datasetId: 'fintech',
  },
  {
    id: 'stripe-python-2',
    title: 'A/B Test Significance',
    topic: 'python',
    difficulty: 'medium',
    fintechDomain: 'payments',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['python', 'experimentation', 'statistics'],
    description: `Given two arrays: control_conversions (binary), treatment_conversions (binary). Perform a two-proportion z-test to determine if the treatment has a statistically significant lift. Return the p-value and whether the result is significant at alpha=0.05.`,
    starterCode: `import numpy as np
from scipy import stats

def ab_test_significance(control: np.ndarray, treatment: np.ndarray) -> dict:
    """Two-proportion z-test for A/B test."""
    # Your code here
    pass
`,
    solution: `import numpy as np
from scipy import stats

def ab_test_significance(control: np.ndarray, treatment: np.ndarray) -> dict:
    n_c, n_t = len(control), len(treatment)
    p_c, p_t = control.mean(), treatment.mean()
    p_pool = (control.sum() + treatment.sum()) / (n_c + n_t)
    se = np.sqrt(p_pool * (1 - p_pool) * (1/n_c + 1/n_t))
    z = (p_t - p_c) / se if se > 0 else 0
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))
    return {'p_value': p_value, 'significant': p_value < 0.05}

# Example
control = np.array([0, 1, 0, 1, 1, 0, 1])
treatment = np.array([1, 1, 1, 1, 0, 1, 1])
print(ab_test_significance(control, treatment))`,
    hints: ['Pooled proportion: (x1+x2)/(n1+n2)', 'SE = sqrt(p*(1-p)*(1/n1+1/n2))', 'scipy.stats.norm.cdf for p-value'],
    datasetId: 'fintech',
  },
  {
    id: 'stripe-python-3',
    title: 'Rolling Conversion Rate',
    topic: 'python',
    difficulty: 'easy',
    fintechDomain: 'payments',
    company: 'Stripe',
    role: 'Data Scientist',
    source: 'curated',
    skills: ['python', 'analytics'],
    description: `Given a DataFrame with columns date, views, conversions. Compute the 7-day rolling conversion rate (conversions/views). Return DataFrame with date and rolling_cvr.`,
    starterCode: `import pandas as pd

def rolling_conversion_rate(df: pd.DataFrame, window: int = 7) -> pd.DataFrame:
    """Compute rolling conversion rate."""
    # Your code here
    pass
`,
    solution: `import pandas as pd

def rolling_conversion_rate(df: pd.DataFrame, window: int = 7) -> pd.DataFrame:
    df = df.copy()
    df['rolling_views'] = df['views'].rolling(window).sum()
    df['rolling_conversions'] = df['conversions'].rolling(window).sum()
    df['rolling_cvr'] = df['rolling_conversions'] / df['rolling_views']
    return df[['date', 'rolling_cvr']]

# Example
df = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=14, freq='D'),
    'views': [100]*14,
    'conversions': [5, 6, 4, 7, 5, 6, 8, 5, 6, 7, 5, 6, 7, 8]
})
print(rolling_conversion_rate(df))`,
    hints: ['Use rolling(window).sum() for both columns', 'Divide rolling conversions by rolling views'],
    datasetId: 'fintech',
  },
];
