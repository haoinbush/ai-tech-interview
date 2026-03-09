-- Stripe-style schema for company-specific SQL exercises
-- Based on DataLemur Stripe SQL interview questions

-- Repeated Payments
CREATE TABLE IF NOT EXISTS stripe_transactions (
  transaction_id INTEGER PRIMARY KEY,
  merchant_id INTEGER NOT NULL,
  credit_card_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  transaction_timestamp TEXT NOT NULL
);

INSERT INTO stripe_transactions VALUES
(1, 101, 1, 100, '2022-09-25 12:00:00'),
(2, 101, 1, 100, '2022-09-25 12:08:00'),
(3, 101, 1, 100, '2022-09-25 12:28:00'),
(4, 102, 2, 300, '2022-09-25 12:00:00'),
(5, 102, 2, 300, '2022-09-25 12:05:00'),
(6, 102, 2, 400, '2022-09-25 14:00:00');

-- Employees (for self-join question)
CREATE TABLE IF NOT EXISTS stripe_employees (
  employee_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary REAL NOT NULL,
  department_id INTEGER,
  manager_id INTEGER
);

INSERT INTO stripe_employees VALUES
(1, 'Emma Thompson', 3800, 1, NULL),
(2, 'Daniel Rodriguez', 2230, 1, 10),
(3, 'Olivia Smith', 8000, 1, 8),
(4, 'Noah Johnson', 6800, 2, 8),
(5, 'Sophia Martinez', 1750, 1, 10),
(8, 'William Davis', 7000, 2, NULL),
(10, 'James Anderson', 4000, 1, NULL);

-- Customers and transactions (for highest customer per month)
CREATE TABLE IF NOT EXISTS stripe_customers (
  customer_id INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL,
  sign_up_date TEXT NOT NULL
);

INSERT INTO stripe_customers VALUES
(1, 'John', '2021-05-10'),
(2, 'Anna', '2021-04-22'),
(3, 'Bob', '2021-07-16'),
(4, 'Cindy', '2021-06-30'),
(5, 'Evan', '2021-08-01');

CREATE TABLE IF NOT EXISTS stripe_customer_transactions (
  transaction_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  transaction_date TEXT NOT NULL,
  amount REAL NOT NULL
);

INSERT INTO stripe_customer_transactions VALUES
(101, 1, '2022-01-15', 100.00),
(102, 3, '2022-01-20', 150.00),
(103, 1, '2022-01-21', 200.00),
(104, 4, '2022-02-15', 250.00),
(105, 2, '2022-02-20', 150.00),
(106, 5, '2022-03-01', 300.00),
(107, 1, '2022-03-15', 350.00),
(108, 2, '2022-03-18', 100.00);

-- Click-through (views and adds)
CREATE TABLE IF NOT EXISTS stripe_views (
  view_id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  view_date TEXT NOT NULL,
  service_id INTEGER NOT NULL
);

INSERT INTO stripe_views VALUES
(101, '001', '2022-06-08', 2001),
(102, '007', '2022-06-10', 2002),
(103, '003', '2022-06-18', 2002),
(104, '003', '2022-06-23', 2001),
(105, '009', '2022-06-26', 2003);

CREATE TABLE IF NOT EXISTS stripe_adds (
  add_id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  add_date TEXT NOT NULL,
  service_id INTEGER NOT NULL
);

INSERT INTO stripe_adds VALUES
(501, '003', '2022-06-18', 2002),
(502, '007', '2022-06-12', 2002),
(503, '003', '2022-06-25', 2001),
(504, '010', '2022-06-27', 2003),
(505, '008', '2022-06-29', 2002);
