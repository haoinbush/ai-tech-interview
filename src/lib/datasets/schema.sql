-- Fintech schema for SQL exercises

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_prices (
  id INTEGER PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  open REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  close REAL NOT NULL,
  volume INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  quantity REAL NOT NULL,
  avg_cost REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_metrics (
  id INTEGER PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  volatility REAL NOT NULL,
  beta REAL NOT NULL,
  sharpe_ratio REAL NOT NULL
);

-- Seed data
INSERT INTO transactions (user_id, amount, currency, timestamp, type) VALUES
(1, 150.50, 'USD', '2024-01-15 10:30:00', 'deposit'),
(1, 75.25, 'USD', '2024-01-16 14:20:00', 'withdrawal'),
(2, 1200.00, 'USD', '2024-01-15 09:00:00', 'deposit'),
(1, 200.00, 'EUR', '2024-01-17 11:00:00', 'transfer'),
(3, 50.00, 'USD', '2024-01-18 16:45:00', 'withdrawal'),
(2, 300.50, 'USD', '2024-01-19 08:30:00', 'deposit'),
(1, 500.00, 'USD', '2024-01-20 12:00:00', 'deposit'),
(3, 25.75, 'EUR', '2024-01-21 15:00:00', 'transfer'),
(2, 800.00, 'USD', '2024-01-22 10:00:00', 'withdrawal'),
(1, 100.00, 'USD', '2024-01-23 09:30:00', 'deposit'),
(4, 2500.00, 'USD', '2024-01-24 11:00:00', 'deposit'),
(5, 99.99, 'USD', '2024-01-25 14:00:00', 'transfer');

INSERT INTO stock_prices (symbol, date, open, high, low, close, volume) VALUES
('AAPL', '2024-01-15', 185.0, 187.5, 184.0, 186.2, 50000000),
('AAPL', '2024-01-16', 186.2, 188.0, 185.5, 187.5, 48000000),
('AAPL', '2024-01-17', 187.5, 189.0, 186.0, 188.0, 52000000),
('AAPL', '2024-01-18', 188.0, 190.5, 187.0, 189.5, 55000000),
('AAPL', '2024-01-19', 189.5, 191.0, 188.5, 190.0, 51000000),
('GOOGL', '2024-01-15', 140.0, 142.0, 139.0, 141.0, 30000000),
('GOOGL', '2024-01-16', 141.0, 143.5, 140.5, 142.5, 32000000),
('GOOGL', '2024-01-17', 142.5, 144.0, 141.0, 143.0, 31000000),
('GOOGL', '2024-01-18', 143.0, 145.0, 142.0, 144.5, 33000000),
('GOOGL', '2024-01-19', 144.5, 146.0, 143.5, 145.0, 29000000),
('MSFT', '2024-01-15', 390.0, 392.0, 388.0, 391.0, 25000000),
('MSFT', '2024-01-16', 391.0, 394.0, 390.0, 393.0, 26000000),
('MSFT', '2024-01-17', 393.0, 395.0, 391.0, 394.0, 24000000),
('MSFT', '2024-01-18', 394.0, 396.5, 392.0, 395.5, 27000000),
('MSFT', '2024-01-19', 395.5, 398.0, 394.0, 397.0, 25500000);

INSERT INTO portfolio_holdings (user_id, symbol, quantity, avg_cost) VALUES
(1, 'AAPL', 100, 185.0),
(1, 'GOOGL', 50, 140.0),
(2, 'AAPL', 200, 186.0),
(2, 'MSFT', 25, 390.0),
(3, 'GOOGL', 75, 141.0),
(3, 'MSFT', 10, 391.0);

INSERT INTO risk_metrics (symbol, date, volatility, beta, sharpe_ratio) VALUES
('AAPL', '2024-01-19', 0.25, 1.2, 1.5),
('GOOGL', '2024-01-19', 0.28, 1.1, 1.3),
('MSFT', '2024-01-19', 0.22, 1.0, 1.8),
('AAPL', '2024-01-18', 0.24, 1.2, 1.4),
('GOOGL', '2024-01-18', 0.35, 1.1, 1.1),
('MSFT', '2024-01-18', 0.20, 1.0, 1.9);
