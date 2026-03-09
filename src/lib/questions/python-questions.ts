import type { Question } from '@/types/question';

export const pythonQuestions: Question[] = [
  {
    id: 'python-1',
    title: 'Calculate Sharpe ratio',
    topic: 'python',
    difficulty: 'medium',
    fintechDomain: 'risk',
    description: 'Given a pandas Series of daily returns, calculate the annualized Sharpe ratio. Assume 252 trading days per year and risk-free rate of 0.02. Formula: (mean_return - rf) / std_return * sqrt(252).',
    starterCode: `import pandas as pd
import numpy as np

def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """Calculate annualized Sharpe ratio from daily returns."""
    # Your code here
    pass

# Example usage (returns will be provided when running)
# returns = pd.Series([0.01, -0.02, 0.015, 0.03, -0.01])
# print(calculate_sharpe_ratio(returns))
`,
    solution: `import pandas as pd
import numpy as np

def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """Calculate annualized Sharpe ratio from daily returns."""
    excess_returns = returns - risk_free_rate / 252
    if excess_returns.std() == 0:
        return 0.0
    return np.sqrt(252) * excess_returns.mean() / excess_returns.std()

# Example usage
returns = pd.Series([0.01, -0.02, 0.015, 0.03, -0.01])
print(f"Sharpe ratio: {calculate_sharpe_ratio(returns):.4f}")`,
    hints: ['Annualize by multiplying by sqrt(252)', 'Handle zero std to avoid division by zero'],
    datasetId: 'fintech',
  },
  {
    id: 'python-2',
    title: 'Pandas aggregation on transactions',
    topic: 'python',
    difficulty: 'easy',
    fintechDomain: 'payments',
    description: 'Given a DataFrame df with columns: user_id, amount, currency. Group by user_id and currency, then compute the sum of amount and count of transactions. Return the result.',
    starterCode: `import pandas as pd

def aggregate_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate transactions by user and currency."""
    # Your code here
    pass

# df will be provided when running
`,
    solution: `import pandas as pd

def aggregate_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate transactions by user and currency."""
    return df.groupby(['user_id', 'currency']).agg(
        total_amount=('amount', 'sum'),
        transaction_count=('amount', 'count')
    ).reset_index()

# Example
df = pd.DataFrame({
    'user_id': [1, 1, 2, 1],
    'amount': [100, 200, 50, 150],
    'currency': ['USD', 'USD', 'EUR', 'USD']
})
print(aggregate_transactions(df))`,
    hints: ['Use groupby with agg', 'agg can take (column, function) tuples'],
    datasetId: 'fintech',
  },
  {
    id: 'python-3',
    title: 'Moving average of stock prices',
    topic: 'python',
    difficulty: 'easy',
    fintechDomain: 'trading',
    description: 'Given a pandas Series of closing prices, compute the 5-day simple moving average. Return a Series with the same index.',
    starterCode: `import pandas as pd

def moving_average(prices: pd.Series, window: int = 5) -> pd.Series:
    """Compute simple moving average."""
    # Your code here
    pass
`,
    solution: `import pandas as pd

def moving_average(prices: pd.Series, window: int = 5) -> pd.Series:
    """Compute simple moving average."""
    return prices.rolling(window=window).mean()

# Example
prices = pd.Series([100, 102, 101, 105, 103, 107, 106, 108, 110, 109])
print(moving_average(prices))`,
    hints: ['Use pandas rolling()', 'rolling().mean() for SMA'],
    datasetId: 'fintech',
  },
  {
    id: 'python-4',
    title: 'Max drawdown calculation',
    topic: 'python',
    difficulty: 'medium',
    fintechDomain: 'risk',
    description: 'Calculate the maximum drawdown from a Series of cumulative returns. Max drawdown = (peak - trough) / peak. Return the drawdown as a positive number (e.g., 0.15 for 15% drawdown).',
    starterCode: `import pandas as pd
import numpy as np

def max_drawdown(cumulative_returns: pd.Series) -> float:
    """Calculate maximum drawdown from cumulative returns."""
    # Your code here
    pass
`,
    solution: `import pandas as pd
import numpy as np

def max_drawdown(cumulative_returns: pd.Series) -> float:
    """Calculate maximum drawdown from cumulative returns."""
    rolling_max = cumulative_returns.cummax()
    drawdowns = (rolling_max - cumulative_returns) / rolling_max
    return float(drawdowns.max())

# Example
cum_returns = pd.Series([1.0, 1.05, 1.02, 0.98, 1.10, 1.03])
print(f"Max drawdown: {max_drawdown(cum_returns):.2%}")`,
    hints: ['Use cummax() to track running peak', 'Drawdown = (peak - current) / peak'],
    datasetId: 'fintech',
  },
  {
    id: 'python-5',
    title: 'Filter high-value transactions',
    topic: 'python',
    difficulty: 'easy',
    fintechDomain: 'payments',
    description: 'Given a DataFrame with columns user_id, amount, timestamp. Filter to keep only transactions where amount is in the top 10% (90th percentile or above). Return the filtered DataFrame.',
    starterCode: `import pandas as pd

def filter_high_value(df: pd.DataFrame) -> pd.DataFrame:
    """Keep only transactions in top 10% by amount."""
    # Your code here
    pass
`,
    solution: `import pandas as pd

def filter_high_value(df: pd.DataFrame) -> pd.DataFrame:
    """Keep only transactions in top 10% by amount."""
    threshold = df['amount'].quantile(0.9)
    return df[df['amount'] >= threshold]

# Example
df = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'amount': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    'timestamp': pd.date_range('2024-01-01', periods=10, freq='D')
})
print(filter_high_value(df))`,
    hints: ['Use quantile(0.9) for 90th percentile', 'Boolean indexing with >='],
    datasetId: 'fintech',
  },
  {
    id: 'python-6',
    title: 'Portfolio weights',
    topic: 'python',
    difficulty: 'medium',
    fintechDomain: 'portfolio',
    description: 'Given a DataFrame with columns symbol and value (market value per holding), compute the portfolio weight (percentage) for each symbol. Return a DataFrame with symbol, value, and weight.',
    starterCode: `import pandas as pd

def portfolio_weights(df: pd.DataFrame) -> pd.DataFrame:
    """Compute portfolio weights from market values."""
    # Your code here
    pass
`,
    solution: `import pandas as pd

def portfolio_weights(df: pd.DataFrame) -> pd.DataFrame:
    """Compute portfolio weights from market values."""
    total = df['value'].sum()
    df = df.copy()
    df['weight'] = df['value'] / total
    return df

# Example
df = pd.DataFrame({'symbol': ['AAPL', 'GOOGL', 'MSFT'], 'value': [5000, 3000, 2000]})
print(portfolio_weights(df))`,
    hints: ['Weight = value / total_value', 'Use .sum() for total'],
    datasetId: 'fintech',
  },
  {
    id: 'python-7',
    title: 'Volatility (standard deviation of returns)',
    topic: 'python',
    difficulty: 'easy',
    fintechDomain: 'risk',
    description: 'Given a pandas Series of daily returns, compute the annualized volatility. Annualize by multiplying by sqrt(252).',
    starterCode: `import pandas as pd
import numpy as np

def annualized_volatility(returns: pd.Series) -> float:
    """Compute annualized volatility from daily returns."""
    # Your code here
    pass
`,
    solution: `import pandas as pd
import numpy as np

def annualized_volatility(returns: pd.Series) -> float:
    """Compute annualized volatility from daily returns."""
    return returns.std() * np.sqrt(252)

# Example
returns = pd.Series([0.01, -0.02, 0.015, 0.03, -0.01])
print(f"Annualized vol: {annualized_volatility(returns):.2%}")`,
    hints: ['std() for standard deviation', 'Multiply by sqrt(252) to annualize'],
    datasetId: 'fintech',
  },
  {
    id: 'python-8',
    title: 'Pivot transactions by type',
    topic: 'python',
    difficulty: 'medium',
    fintechDomain: 'payments',
    description: 'Given a DataFrame with user_id, amount, and type columns. Pivot so each row is a user and columns are type (deposit, withdrawal, transfer) with sum of amount. Fill NaN with 0.',
    starterCode: `import pandas as pd

def pivot_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Pivot transactions by user and type."""
    # Your code here
    pass
`,
    solution: `import pandas as pd

def pivot_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """Pivot transactions by user and type."""
    return df.pivot_table(
        index='user_id',
        columns='type',
        values='amount',
        aggfunc='sum',
        fill_value=0
    ).reset_index()

# Example
df = pd.DataFrame({
    'user_id': [1, 1, 2, 1],
    'amount': [100, 50, 200, 75],
    'type': ['deposit', 'withdrawal', 'deposit', 'transfer']
})
print(pivot_transactions(df))`,
    hints: ['Use pivot_table', 'aggfunc="sum", fill_value=0'],
    datasetId: 'fintech',
  },
];
